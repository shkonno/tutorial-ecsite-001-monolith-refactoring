type Labels = Record<string, string | number>

// Edge Runtime does not support prom-client, so provide no-op fallbacks.
class NoopCounter {
  inc(_labels?: Labels, _value?: number) {}
}

class NoopGauge {
  inc(_labels?: Labels, _value?: number) {}
  dec(_labels?: Labels, _value?: number) {}
  set(_labels?: Labels, _value?: number) {}
}

class NoopHistogram {
  observe(_labels?: Labels, _value?: number) {}
}

export const httpRequestCounter = new NoopCounter()
export const httpRequestDuration = new NoopHistogram()
export const httpRequestsInProgress = new NoopGauge()
