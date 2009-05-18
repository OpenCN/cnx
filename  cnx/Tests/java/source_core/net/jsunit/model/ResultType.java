package net.jsunit.model;

public enum ResultType {
    SECURITY_VIOLATION {
        public String getDisplayString() {
            return "security violation";
        }

        public boolean contactedServer() {
            return false;
        }
    },
    UNRESPONSIVE {
        public String getDisplayString() {
            return "unresponsive";
        }

        public boolean contactedServer() {
            return false;
        }
    },
    FAILED_TO_LAUNCH {
        public String getDisplayString() {
            return "failed to launch";
        }

        public boolean failedToLaunch() {
            return true;
        }
    },
    TIMED_OUT {
        public String getDisplayString() {
            return "timed out";
        }

        public boolean timedOut() {
            return true;
        }
    },
    ERROR {
        public String getDisplayString() {
            return "error";
        }
    },
    FAILURE {
        public String getDisplayString() {
            return "failure";
        }
    },
    SUCCESS {
        public String getDisplayString() {
            return "success";
        }
    };

    public abstract String getDisplayString();

    public final boolean completedTestRun() {
        return !timedOut() && !failedToLaunch() && contactedServer();
    }

    public boolean timedOut() {
        return false;
    }

    public boolean failedToLaunch() {
        return false;
    }

    public boolean isWorseThan(ResultType other) {
        return ordinal() < other.ordinal();
    }

    public boolean contactedServer() {
        return true;
    }
}
