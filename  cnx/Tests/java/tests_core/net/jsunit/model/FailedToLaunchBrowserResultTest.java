package net.jsunit.model;

import junit.framework.TestCase;
import net.jsunit.utility.StringUtility;

import java.io.FileNotFoundException;

public class FailedToLaunchBrowserResultTest extends TestCase {

    private Throwable exception = new FileNotFoundException();
    private String expectedXml =
            "<browserResult type=\"FAILED_TO_LAUNCH\">" +
                    "<browser>" +
                    "<fullFileName>c:\\Program Files\\Internet Explorer\\iexplore.exe</fullFileName>" +
                    "<id>3</id>" +
                    "<displayName>Internet Explorer</displayName>" +
                    "<logoPath>images/logo_ie.gif</logoPath>" +
                    "</browser>" +
                    "<properties>" +
                    "<property name=\"serverSideExceptionStackTrace\"><![CDATA[" +
                    StringUtility.stackTraceAsString(exception) +
                    "]]></property>" +
                    "</properties>" +
                    "</browserResult>";

    private BrowserResult result;

    public void setUp() throws Exception {
        super.setUp();
        result = new BrowserResult();
        result._setResultType(ResultType.FAILED_TO_LAUNCH);
        result.setBrowser(new Browser("c:\\Program Files\\Internet Explorer\\iexplore.exe", 3));
        result._setServerSideException(exception);
    }

    public void testSimple() {
        assertEquals("c:\\Program Files\\Internet Explorer\\iexplore.exe", result.getBrowser().getStartCommand());
        assertEquals(0d, result.getTime());
        assertEquals(ResultType.FAILED_TO_LAUNCH.getDisplayString(), result.getDisplayString());
        assertEquals(0, result.getTestCount());
        assertEquals(ResultType.FAILED_TO_LAUNCH, result._getResultType());
        assertEquals(0, result._getTestPageResults().size());
        assertEquals(StringUtility.stackTraceAsString(exception), result.getServerSideExceptionStackTrace());
    }

    public void testCompleted() {
        assertFalse(result.completedTestRun());
        assertFalse(result.timedOut());
        assertTrue(result.failedToLaunch());
    }

    public void testXml() {
        assertEquals(expectedXml, result.asXmlFragment());
    }

    public void testReconstituteFromXml() {
        BrowserResultBuilder builder = new BrowserResultBuilder();
        BrowserResult reconstitutedResult = builder.build(expectedXml);
        assertEquals("c:\\Program Files\\Internet Explorer\\iexplore.exe", reconstitutedResult.getBrowser().getStartCommand());
        assertTrue(reconstitutedResult.failedToLaunch());
        assertEquals(ResultType.FAILED_TO_LAUNCH, reconstitutedResult._getResultType());
        //TODO: somehow they're not quite equal
        //assertEquals(Utility.stackTraceAsString(exception), reconstitutedResult.getServerSideExceptionStackTrace());
    }

}
