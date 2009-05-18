package net.jsunit;

import junit.framework.TestCase;
import junit.framework.TestResult;
import junit.framework.TestSuite;
import net.jsunit.configuration.ConfigurationSource;

public class SerialDistributedTestTest extends TestCase {
    public void testTwoTestsInSerial() throws Throwable {
        final int port = new TestPortManager().newPort();
        ConfigurationSource source = new FunctionalTestConfigurationSource(port) {
            public String remoteMachineURLs() {
                return "http://localhost:" + port;
            }

            public String browserFileNames() {
                return "";
            }
        };
        TestSuite testSuite = new TestSuite();
        testSuite.addTest(new DistributedTest(source));
        testSuite.addTest(new DistributedTest(source));
        TestResult testResult = new TestResult();
        testSuite.run(testResult);
        assertTrue(testResult.wasSuccessful());
    }
}
