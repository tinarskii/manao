import { Elysia } from "elysia";
import { APP_DIR, token } from "../config";
import { renderPage } from "../index";

/**
 * Configuration for secured pages with consistent structure
 */
interface SecuredPage {
  path: string;        // URL path
  title: string;       // Page title
  excludeTailwind?: boolean;  // Whether to exclude Tailwind CSS
  excludeTemplate?: boolean;  // Whether to exclude template
}

export function registerSecuredPageRoutes(app: Elysia) {
  // Define secured pages configuration in one place
  const securedPages: SecuredPage[] = [
    { path: "feed", title: "Feed - Manaobot Web", excludeTailwind: true, excludeTemplate: true },
    { path: "chat", title: "Chat - Manaobot Web", excludeTailwind: true, excludeTemplate: true },
    { path: "music", title: "Music - Manaobot Web", excludeTailwind: false, excludeTemplate: true },
    { path: "soundboard", title: "Soundboard - Manaobot Web", excludeTailwind: false, excludeTemplate: false },
    { path: "commands", title: "Commands - Manaobot Web", excludeTailwind: false, excludeTemplate: false },
    { path: "command-edit", title: "Edit Command - Manaobot Web", excludeTailwind: false, excludeTemplate: false },
  ];

  // Generate HTML for unauthorized access
  const generateTokenPromptHtml = (path: string) => {
    return `
      <!doctype html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Token Required | Manaobot Web</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
          h1 { color: #333; }
          .error { color: red; margin-top: 20px; display: none; }
        </style>
      </head>
      <body>
        <h1>Authentication Required</h1>
        <p>Please enter your access token to continue:</p>
        <div>
          <input type="password" id="tokenInput" placeholder="Enter token" />
          <button id="submitBtn">Submit</button>
        </div>
        <div class="error" id="errorMsg">Invalid token. Please try again.</div>

        <script>
          // Check if token exists in storage
          const storedToken = localStorage.getItem("token");
          const targetPath = "${path}";
          
          // Function to validate token
          function validateToken(inputToken) {
            // XSS prevention - Don't include actual token in client-side code
            fetch('/api/validate-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: inputToken })
            })
            .then(response => {
              if (response.ok) {
                localStorage.setItem("token", inputToken);
                window.location.href = "/" + targetPath + "?token=" + encodeURIComponent(inputToken);
              } else {
                document.getElementById("errorMsg").style.display = "block";
              }
            })
            .catch(() => {
              document.getElementById("errorMsg").style.display = "block";
            });
          }

          // Auto-redirect if token exists
          if (storedToken) {
            validateToken(storedToken);
          }

          // Handle form submission
          document.getElementById("submitBtn").addEventListener("click", () => {
            const inputToken = document.getElementById("tokenInput").value;
            validateToken(inputToken);
          });

          // Handle Enter key press
          document.getElementById("tokenInput").addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              const inputToken = document.getElementById("tokenInput").value;
              validateToken(inputToken);
            }
          });
        </script>
      </body>
      </html>
    `;
  };

  /**
   * Create handler for secured pages with token validation
   */
  const createSecuredHandler = (page: SecuredPage) => {
    return ({ query, set, request }: { query: any; set: any; request: Request }) => {
      // Handle token validation
      if (!query.token) {
        set.headers["Content-Type"] = "text/html";
        return generateTokenPromptHtml(page.path);
      }

      // Server-side token validation
      if (query.token !== token) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { "Content-Type": "text/plain" }
        });
      }

      // Token is valid, serve the requested page
      set.headers["Content-Type"] = "text/html";
      set.headers["Cache-Control"] = "no-store, no-cache, must-revalidate";

      return renderPage({
        path: `${APP_DIR}/${page.path}.html`,
        pageName: page.title,
        stylesheet: `/css/${page.path}.css`,
        script: `/js/${page.path}.js`,
        excludeTailwind: page.excludeTailwind,
        excludeTemplate: page.excludeTemplate,
      });
    };
  };

  // Register API route for token validation
  app.post('/api/validate-token', ({ body, set }) => {
    // @ts-ignore
    const isValid = body.token === token;

    if (isValid) {
      set.status = 200;
      return { valid: true };
    } else {
      set.status = 401;
      return { valid: false };
    }
  });

  // Register all secured page routes
  for (const page of securedPages) {
    app.get(`/${page.path}`, createSecuredHandler(page));
  }

  return app;
}
