(function () {
  // Helper function to convert a URL to its absolute form using the document's base URI.
  function convertToAbsoluteUrl(url, baseUrl = document.baseURI) {
    try {
      // Use the native URL constructor for robust absolutization, respecting <base> tag.
      return new URL(url, baseUrl).href;
    } catch (e) {
      console.error(
        "Canonical Tracker: Error converting URL to absolute:",
        url,
        e,
      );
      return null; // Return null if URL is invalid
    }
  }

  // Helper function to send the identified canonical URL to Google Analytics 4.
  // It attempts to auto-detect gtag.js or dataLayer.push.
  function sendToGa4(canonicalUrl) {
    const eventName = "canonical_info_ready";
    const paramName = "page_canonical_url";

    if (typeof window.gtag === "function") {
      // GA4: Use gtag.js method if available
      window.gtag("event", eventName, {
        [paramName]: canonicalUrl,
      });
    } else if (Array.isArray(window.dataLayer)) {
      // GA4: Use dataLayer.push method for GTM if dataLayer array is available
      window.dataLayer.push({
        event: eventName,
        [paramName]: canonicalUrl,
      });
    } else {
      // GA4: Neither gtag.js nor dataLayer found, log a warning with the URL that wasn't sent.
      console.warn(
        `Canonical Tracker: GA4 tracking (gtag.js or GTM dataLayer) not found. Canonical URL identified but not sent: ${canonicalUrl}`,
      );
    }
  }

  // Function to find and validate the canonical URL from the HTML <link rel="canonical"> tag.
  function getCanonicalFromHtmlTag() {
    try {
      // Query the DOM for the first link tag with rel="canonical"
      const linkTag = document.querySelector('link[rel="canonical"]');

      if (!linkTag) {
        return null; // Return null if the tag is not present
      }

      // Validate the href attribute exists and is not empty
      const href = linkTag.getAttribute("href");
      if (!href || href.trim() === "") {
        // Use trim() to catch hrefs with only whitespace
        console.warn(
          'Canonical Tracker: HTML <link rel="canonical"> tag found but is missing or has empty href attribute.',
        );
        return null; // Return null if href is missing or empty
      }

      // Verify the tag is located within the document's <head> section
      if (!linkTag.closest("head")) {
        console.warn(
          'Canonical Tracker: HTML <link rel="canonical"> tag found but is not within the <head> section. Ignoring.',
        );
        return null; // Return null if the tag is outside <head>
      }

      // Optional: Check for multiple canonical tags (indicates a site misconfiguration)
      const allCanonicalTags = document.querySelectorAll(
        'link[rel="canonical"]',
      );
      if (allCanonicalTags.length > 1) {
        console.warn(
          `Canonical Tracker: Multiple <link rel="canonical"> tags found (${allCanonicalTags.length}). Using the first one encountered in the DOM.`,
        );
      }

      return href; // Return the href value
    } catch (error) {
      // Handle any errors during DOM querying or validation
      console.error(
        "Canonical Tracker: Error getting canonical from HTML tag:",
        error,
      );
      return null; // Return null on error
    }
  }

  // Main function to identify the canonical URL and send to GA4.
  function identifyAndSendCanonicalUrl() {
    let determinedCanonicalUrl = window.location.href; // Default to current page URL
    const rawHrefFromTag = getCanonicalFromHtmlTag();

    if (rawHrefFromTag) {
      const absoluteFromTag = convertToAbsoluteUrl(rawHrefFromTag);
      if (absoluteFromTag) {
        determinedCanonicalUrl = absoluteFromTag; // Override with absolutized tag URL
      }
      // If absoluteFromTag is null (conversion failed),
      // convertToAbsoluteUrl has already logged the specific error.
      // determinedCanonicalUrl correctly remains window.location.href (the default).
    }
    // If rawHrefFromTag was null (no valid canonical tag found),
    // determinedCanonicalUrl also remains window.location.href (the default).

    sendToGa4(determinedCanonicalUrl);
  }

  // Execute the main identification and sending logic.
  // Waits for DOMContentLoaded if the document is still loading to ensure <head> is available.
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", identifyAndSendCanonicalUrl);
  } else {
    identifyAndSendCanonicalUrl();
  }
})(); // Immediately Invoked Function Expression (IIFE) to avoid global scope pollution
