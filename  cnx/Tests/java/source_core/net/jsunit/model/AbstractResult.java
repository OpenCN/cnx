package net.jsunit.model;

import java.util.List;

public abstract class AbstractResult implements Result {

    public ResultType _getResultType() {
        ResultType worstResultType = ResultType.SUCCESS;
        for (Result childResult : getChildren()) {
            ResultType childResultType = childResult._getResultType();
            if (childResultType.isWorseThan(worstResultType))
                worstResultType = childResultType;
        }
        return worstResultType;
    }

    public int getFailureCount() {
        int failureCount = 0;
        for (Result childResult : getChildren())
            failureCount += childResult.getFailureCount();
        return failureCount;
    }

    public int getErrorCount() {
        int errorCount = 0;
        for (Result childResult : getChildren())
            errorCount += childResult.getErrorCount();
        return errorCount;
    }

    public int getTestCount() {
        int result = 0;
        for (Result childResult : getChildren())
            result += childResult.getTestCount();
        return result;
    }

    public boolean wasSuccessful() {
        return _getResultType() == ResultType.SUCCESS;
    }

    protected abstract List<? extends Result> getChildren();

    public String displayString() {
        ResultType resultType = _getResultType();

        if (resultType.completedTestRun()) {
            StringBuffer buffer = new StringBuffer();
            buffer.append("The test run had ");
            buffer.append(getErrorCount());
            buffer.append(" error(s) and ");
            buffer.append(getFailureCount());
            buffer.append(" failure(s).");
            return buffer.toString();
        } else {
            return "JsUnit test execution failed. Reason: " + resultType.getDisplayString();
        }
    }

    public final void addErrorStringTo(StringBuffer buffer) {
        if (wasSuccessful())
            return;
        addMyErrorStringTo(buffer);
        if (hasChildren()) {
            boolean isFirstProblem = true;
            for (Result result : getChildren()) {
                if (!result.wasSuccessful()) {
                    if (!isFirstProblem)
                        buffer.append("\n");
                    addChildErrorStringTo(result, buffer);
                    isFirstProblem = false;
                }
            }
        }
    }

    protected void addChildErrorStringTo(Result child, StringBuffer buffer) {
        child.addErrorStringTo(buffer);
    }

    private boolean hasChildren() {
        return getChildren() != null && !getChildren().isEmpty();
    }

    protected void addMyErrorStringTo(StringBuffer buffer) {
    }

}
