package net.jsunit;

import junit.framework.TestCase;
import net.jsunit.model.Browser;
import net.jsunit.model.ResultType;

import java.io.InputStream;
import java.io.OutputStream;

public class TimeoutCheckerTest extends TestCase {

    private MockBrowserTestRunner mockRunner;
    private TimeoutChecker checker;
    private MockProcess mockProcess;

    public void setUp() throws Exception {
        super.setUp();
        mockRunner = new MockBrowserTestRunner();
        mockRunner.timeoutSeconds = Integer.MAX_VALUE;
        mockProcess = new MockProcess();
        checker = new TimeoutChecker(mockProcess, new Browser("mybrowser.exe", 0), 1, mockRunner, 1);
        checker.start();
        while (!checker.isAlive()) {
            Thread.sleep(10);
        }
    }

    public void tearDown() throws Exception {
        if (checker != null && checker.isAlive()) {
            checker.die();
        }
        super.tearDown();
    }

    public void testDie() throws InterruptedException {
        checker.die();
        while (checker.isAlive())
            Thread.sleep(10);
    }

    public void testTimeOut() throws InterruptedException {
        long start = System.currentTimeMillis();
        mockRunner.waitingForBrowser = true;
        mockRunner.timeoutSeconds = 0;
        while (mockRunner.acceptedResult == null) {
            if (System.currentTimeMillis() - start > 1000) {
                fail("Timed out waiting for mockRunner...");
            }
            Thread.sleep(10);
        }
        assertEquals(ResultType.TIMED_OUT, mockRunner.acceptedResult._getResultType());
    }

    public void testNotTimeOut() throws InterruptedException {
        while (checker.isAlive())
            Thread.sleep(10);
        assertFalse(checker.isAlive());
    }

    static class MockProcess extends Process {

        private boolean done = false;

        public OutputStream getOutputStream() {
            return null;
        }

        public InputStream getInputStream() {
            return null;
        }

        public InputStream getErrorStream() {
            return null;
        }

        public int waitFor() throws InterruptedException {
            return 0;
        }

        public int exitValue() {
            if (!done)
                throw new IllegalThreadStateException();
            else
                return 0;
        }

        public void destroy() {
        }

    }

}
