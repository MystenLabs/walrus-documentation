---
title: "Walrus Sites v2.1.0"
description: "The site-builder supports files larger than `--max-quilt-size`, and the portal returns 503 and 500 responses for service and unhandled errors."
keywords: ["walrus-sites", "release notes", "changelog"]
---

**December 1, 2025**

The site-builder can upload files larger than `--max-quilt-size`. It no longer aborts when you
update sites with more than 1000 resources. It partly handles invalid object versions returned by a
full node, and on Windows it replaces backslashes with forward slashes when converting full paths to
resource paths.

The portal returns a 503 response when a service is unavailable and a 500 response for unhandled
exceptions. The full-node error metric increments correctly, and the portal adds a metric for
aggregator fetching.
