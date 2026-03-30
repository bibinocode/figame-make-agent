type StreamTextQueueOptions = {
  intervalMs?: number;
  onUpdate: (value: string) => void;
};

function getChunkSize(pendingCount: number) {
  if (pendingCount > 160) {
    return 3;
  }

  if (pendingCount > 64) {
    return 2;
  }

  return 1;
}

export function createStreamTextQueue({
  intervalMs = 22,
  onUpdate,
}: StreamTextQueueOptions) {
  let renderedText = "";
  let pendingChars: string[] = [];
  let timerId: number | null = null;

  const commit = (count: number) => {
    if (count <= 0) {
      return;
    }

    renderedText += pendingChars.slice(0, count).join("");
    pendingChars = pendingChars.slice(count);
    onUpdate(renderedText);
  };

  const schedule = () => {
    if (timerId !== null || pendingChars.length === 0) {
      return;
    }

    timerId = window.setTimeout(() => {
      timerId = null;

      if (pendingChars.length === 0) {
        return;
      }

      commit(getChunkSize(pendingChars.length));

      if (pendingChars.length > 0) {
        schedule();
      }
    }, intervalMs);
  };

  return {
    push(chunk: string) {
      if (!chunk) {
        return;
      }

      pendingChars.push(...Array.from(chunk));
      schedule();
    },
    flush(finalText?: string) {
      if (typeof finalText === "string") {
        renderedText = finalText;
        pendingChars = [];
      } else if (pendingChars.length > 0) {
        commit(pendingChars.length);
      }

      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }

      onUpdate(renderedText);
    },
    stop() {
      if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
      }
    },
  };
}
