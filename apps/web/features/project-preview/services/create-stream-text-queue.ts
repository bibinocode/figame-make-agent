type StreamTextQueueOptions = {
  intervalMs?: number;
  onUpdate: (value: string) => void;
};

function getChunkSize(pendingCount: number) {
  if (pendingCount > 96) {
    return 8;
  }

  if (pendingCount > 48) {
    return 6;
  }

  if (pendingCount > 24) {
    return 4;
  }

  if (pendingCount > 12) {
    return 3;
  }

  if (pendingCount > 4) {
    return 2;
  }

  return 1;
}

export function createStreamTextQueue({
  intervalMs = 16,
  onUpdate,
}: StreamTextQueueOptions) {
  let renderedText = "";
  let targetChars: string[] = [];
  let renderedCount = 0;
  let timerId: number | null = null;

  const commit = () => {
    renderedText = targetChars.slice(0, renderedCount).join("");
    onUpdate(renderedText);
  };

  const schedule = () => {
    if (timerId !== null) {
      return;
    }

    timerId = window.setTimeout(() => {
      timerId = null;

      if (renderedCount >= targetChars.length) {
        return;
      }

      const pendingCount = targetChars.length - renderedCount;
      renderedCount = Math.min(
        targetChars.length,
        renderedCount + getChunkSize(pendingCount),
      );
      commit();

      if (renderedCount < targetChars.length) {
        schedule();
      }
    }, intervalMs);
  };

  return {
    setTarget(nextText: string) {
      if (!nextText.startsWith(renderedText)) {
        renderedText = "";
        renderedCount = 0;
      }

      targetChars = Array.from(nextText);

      if (renderedCount >= targetChars.length) {
        commit();
        return;
      }

      schedule();
    },
    flush(finalText?: string) {
      if (typeof finalText === "string") {
        targetChars = Array.from(finalText);
      }

      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }

      renderedCount = targetChars.length;
      commit();
    },
    stop() {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    },
  };
}
