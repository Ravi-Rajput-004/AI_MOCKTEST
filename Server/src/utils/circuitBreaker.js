const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN',
};

export class CircuitBreaker {
  constructor({ failureThreshold = 5, cooldownMs = 60000, name = 'default' } = {}) {
    this.failureThreshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.name = name;

    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }

  isOpen() {
    if (this.state === STATES.OPEN) {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.cooldownMs) {
        this.state = STATES.HALF_OPEN;
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failureCount = 0;
    this.successCount++;
    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.CLOSED;
    }
  }

  recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.failureThreshold) {
      this.state = STATES.OPEN;
    }
  }

  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }
}
