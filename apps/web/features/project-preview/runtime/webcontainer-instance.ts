type Teardownable = {
  teardown: () => void | Promise<void>;
};

type BootWebContainer<TInstance extends Teardownable> = () => Promise<TInstance>;

type WebContainerLease<TInstance extends Teardownable> = {
  instance: TInstance;
  release: () => Promise<void>;
};

let activeLeaseCount = 0;
let pendingBoot: Promise<Teardownable> | null = null;
let pendingTeardown: Promise<void> | null = null;
let sharedInstance: Teardownable | null = null;
let teardownTimer: ReturnType<typeof setTimeout> | null = null;

function clearScheduledTeardown() {
  if (teardownTimer) {
    clearTimeout(teardownTimer);
    teardownTimer = null;
  }
}

async function ensureInstance<TInstance extends Teardownable>(
  bootWebContainer: BootWebContainer<TInstance>,
) {
  clearScheduledTeardown();

  if (sharedInstance) {
    return sharedInstance as TInstance;
  }

  if (!pendingBoot) {
    pendingBoot = bootWebContainer()
      .then((instance) => {
        sharedInstance = instance;
        return instance;
      })
      .finally(() => {
        pendingBoot = null;
      });
  }

  return pendingBoot as Promise<TInstance>;
}

function scheduleTeardown() {
  clearScheduledTeardown();

  teardownTimer = setTimeout(() => {
    teardownTimer = null;

    if (activeLeaseCount > 0 || !sharedInstance) {
      return;
    }

    const instance = sharedInstance;
    sharedInstance = null;
    pendingTeardown = Promise.resolve(instance.teardown()).finally(() => {
      pendingTeardown = null;
    });
  }, 0);
}

export async function acquireWebContainerLease<TInstance extends Teardownable>(
  bootWebContainer: BootWebContainer<TInstance>,
): Promise<WebContainerLease<TInstance>> {
  if (pendingTeardown) {
    await pendingTeardown;
  }

  activeLeaseCount += 1;

  try {
    const instance = await ensureInstance(bootWebContainer);
    let released = false;

    return {
      instance,
      async release() {
        if (released) {
          return;
        }

        released = true;
        activeLeaseCount = Math.max(0, activeLeaseCount - 1);

        if (activeLeaseCount === 0) {
          scheduleTeardown();
        }
      },
    };
  } catch (error) {
    activeLeaseCount = Math.max(0, activeLeaseCount - 1);
    throw error;
  }
}

export async function resetWebContainerManagerForTests() {
  clearScheduledTeardown();
  activeLeaseCount = 0;

  if (pendingTeardown) {
    await pendingTeardown;
  }

  if (pendingBoot) {
    try {
      await pendingBoot;
    } catch {
      // Ignore failed boot attempts when resetting test state.
    }
  }

  if (sharedInstance) {
    await sharedInstance.teardown();
  }

  pendingBoot = null;
  pendingTeardown = null;
  sharedInstance = null;
}
