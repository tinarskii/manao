import { Elysia } from "elysia";
import { APP_DIR, token } from "../config";
import { renderPage } from "../index";
import { db } from "../../helpers/database";
import { PreferencesData } from "../../types";

/**
 * Configuration for secured pages with consistent structure
 */
interface SecuredPage {
  path: string; // URL path
  title: string; // Page title
  excludeTailwind?: boolean; // Whether to exclude Tailwind CSS
  excludeTemplate?: boolean; // Whether to exclude template
}

/**
 * Fetch default song from the database
 */
function fetchDefaultSong() {
  const stmt = db.prepare(
    "SELECT defaultSong FROM preferences WHERE userID = ?",
  );
  let defaultSong = stmt.get(Bun.env.BROADCASTER_ID!) as Pick<
    PreferencesData,
    "defaultSong"
  >;

  if (!defaultSong?.defaultSong) {
    defaultSong = {
      defaultSong: JSON.stringify({
        songTitle: "Sad Flower",
        songAuthor: "Reinizra",
        songThumbnail:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQB4i7JLl4BtWz4gYzUnsx6WcYDAK74ScNGzQ&s",
        songID: "agPF9Eptt1s",
      }),
    };
  }

  // @ts-ignore
  return JSON.parse(defaultSong.defaultSong);
}

/**
 * Register secured page routes with token validation
 * @param app Elysia instance
 * @returns Elysia instance
 */
export function registerSecuredPageRoutes(app: Elysia) {
  // Define secured pages configuration in one place
  const securedPages: SecuredPage[] = [
    {
      path: "feed",
      title: "Feed - Manaobot Web",
      excludeTailwind: true,
      excludeTemplate: true,
    },
    {
      path: "chat",
      title: "Chat - Manaobot Web",
      excludeTailwind: true,
      excludeTemplate: true,
    },
    {
      path: "music",
      title: "Music - Manaobot Web",
      excludeTailwind: false,
      excludeTemplate: true,
    },
    {
      path: "soundboard",
      title: "Soundboard - Manaobot Web",
      excludeTailwind: false,
      excludeTemplate: false,
    },
    {
      path: "commands",
      title: "Commands - Manaobot Web",
      excludeTailwind: false,
      excludeTemplate: false,
    },
    {
      path: "command-edit",
      title: "Edit Command - Manaobot Web",
      excludeTailwind: false,
      excludeTemplate: false,
    },
  ];

  // Generate HTML for the authentication page with enhanced design and improved code
  const generateTokenPromptHtml = (path: string): string => {
    const isChatPage = path === "chat";

    return `
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Authentication page for Manaobot Web" />
      <title>Authentication Required | Manaobot Web</title>
      
      <!-- Tailwind & DaisyUI -->
      <link href="/css/dist/tailwind.css" rel="stylesheet" type="text/css" />
      
      <!-- FontAwesome -->
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      
      <!-- Favicon -->
      <link rel="icon" href="/favicon.ico" />      
    </head>
    <body class="min-h-screen bg-gradient-to-br from-base-300 via-base-100 to-base-300 bg-size-200 animate-gradient">
      <div class="hero min-h-screen">
        <div class="hero-content flex-col lg:flex-row-reverse gap-8 lg:gap-12">
          <!-- Decorative Element -->
          <div class="hidden md:flex flex-col items-center lg:w-1/3 animate-float">
            <div class="relative">
              <div class="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-secondary opacity-75 blur"></div>
              <div class="relative bg-base-200 rounded-full p-8">
                <i class="fa-solid fa-lemon text-6xl text-primary"></i>
              </div>
            </div>
            <div class="mt-6 text-center">
              <h2 class="text-2xl font-bold text-base-content">Manaobot Web</h2>
              <p class="text-base-content/70">A collection of utilities and tools for Twitch streamers</p>
            </div>
          </div>

          <!-- Auth Form -->
          <div class="card w-full max-w-md bg-base-200 shadow-xl">
            <div class="card-body">
              <div class="flex items-center gap-3">
                <i class="fa-solid fa-lock text-primary text-2xl"></i>
                <h1 class="text-2xl font-bold">Authentication Required</h1>
              </div>
              
              <div class="divider"></div>
              
              <p class="text-base-content/80 mb-4">Please enter your access token to continue:</p>
              
              <form id="authForm" class="space-y-4">
                <!-- Token Input -->
                <div class="form-control">
                  <label class="input-group input-group-md">
                    <input 
                      type="password" 
                      id="tokenInput" 
                      class="input input-bordered w-full focus:border-primary" 
                      placeholder="Enter token"
                      autocomplete="off"
                      required
                    />
                  </label>
                </div>
                
                ${
                  isChatPage
                    ? `
                <!-- Chat Direction Options -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text flex items-center gap-2">
                      <i class="fa-solid fa-arrow-down"></i> Message Direction
                    </span>
                  </label>
                  <div class="bg-base-200 rounded-lg p-1">
                    <div class="grid grid-cols-2 gap-2">
                      <input type="radio" id="ttb" name="direction" value="ttb" class="hidden peer/ttb" checked />
                      <label for="ttb" class="peer-checked/ttb:bg-primary peer-checked/ttb:text-primary-content btn btn-sm normal-case transition-all duration-200 flex gap-2 items-center justify-center">
                        <i class="fa-solid fa-arrow-down"></i> Top to Bottom
                      </label>
                      
                      <input type="radio" id="btt" name="direction" value="btt" class="hidden peer/btt" />
                      <label for="btt" class="peer-checked/btt:bg-primary peer-checked/btt:text-primary-content btn btn-sm normal-case transition-all duration-200 flex gap-2 items-center justify-center">
                        <i class="fa-solid fa-arrow-up"></i> Bottom to Top
                      </label>
                    </div>
                  </div>
                </div>
                                
                <!-- Fade Input -->
                <div class="form-control">
                  <label class="label">
                    <span class="label-text flex items-center gap-2">
                      <i class="fa-solid fa-hourglass-half"></i> Fade Duration
                    </span>
                  </label>
                  <label class="input-group">
                    <input 
                      type="number" 
                      id="fade" 
                      class="input input-bordered w-full" 
                      value="30" 
                      min="5" 
                      max="120"
                      required
                    />
                    <span>seconds</span>
                  </label>
                </div>
                `
                    : ""
                }
                
                <!-- Submit Button -->
                <div class="form-control mt-6">
                  <button 
                    id="submitBtn" 
                    type="submit" 
                    class="btn btn-primary gap-2"
                  >
                    <i class="fa-solid fa-right-to-bracket"></i>
                    <span>Authenticate</span>
                    <span class="loading loading-spinner loading-sm hidden" id="loadingSpinner"></span>
                  </button>
                </div>
              </form>
              
              <!-- Error Message -->
              <div class="alert alert-error shadow-lg mt-4 hidden" id="errorMsg">
                <div>
                  <i class="fa-solid fa-circle-exclamation"></i>
                  <span>Invalid token. Please try again.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <footer class="footer footer-center p-4 bg-base-300 text-base-content">
        <div>
          <p class="flex items-center gap-2">
            Made with <i class="fas fa-heart text-error"></i> by 
            <a href="https://github.com/tinarskii" class="font-bold hover:text-primary transition-all">tinarskii</a>
          </p>
        </div>
      </footer>

      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const authForm = document.getElementById('authForm');
          const tokenInput = document.getElementById('tokenInput');
          const errorMsg = document.getElementById('errorMsg');
          const loadingSpinner = document.getElementById('loadingSpinner');
          const submitBtn = document.getElementById('submitBtn');
          const storedToken = localStorage.getItem('token');
          const targetPath = "${path}";
          
          // Function to show loading state
          const setLoading = (isLoading) => {
            if (isLoading) {
              loadingSpinner.classList.remove('hidden');
              submitBtn.classList.add('btn-disabled');
            } else {
              loadingSpinner.classList.add('hidden');
              submitBtn.classList.remove('btn-disabled');
            }
          };
          
          // Function to show error
          const showError = (message) => {
            errorMsg.querySelector('span').textContent = message || 'Invalid token. Please try again.';
            errorMsg.classList.remove('hidden');
            
            // Auto-hide error after 5 seconds
            setTimeout(() => {
              errorMsg.classList.add('hidden');
            }, 5000);
          };
          
          // Function to validate token with server
          const validateToken = async (inputToken) => {
            try {
              setLoading(true);
              
              // Get direction and fade values if on chat page
              let params = new URLSearchParams();
              params.append('token', inputToken);
              
              if (targetPath === 'chat') {
                const direction = document.querySelector('input[name="direction"]:checked').value;
                const fade = document.getElementById('fade').value;
                params.append('direction', direction);
                params.append('fade', fade);
              }
              
              const response = await fetch('/api/validate-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: inputToken })
              });
              
              if (response.ok) {
                // Save token and redirect
                localStorage.setItem('token', inputToken);
                window.location.href = '/' + targetPath + '?' + params.toString();
              } else {
                const data = await response.json().catch(() => ({}));
                showError(data.message || 'Invalid token. Please try again.');
              }
            } catch (error) {
              console.error('Authentication error:', error);
              showError('Connection error. Please try again.');
            } finally {
              setLoading(false);
            }
          };
          
          // Auto-redirect if a token exists (except for chat page which needs additional params)
          if (storedToken && targetPath !== 'chat') {
            validateToken(storedToken);
          }
          
          // Handle form submission
          authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputToken = tokenInput.value.trim();
            
            if (!inputToken) {
              showError('Please enter a token');
              tokenInput.focus();
              return;
            }
            
            validateToken(inputToken);
          });
          
          // Focus the input field on page load
          tokenInput.focus();
          });
      </script>
      <script src="/js/background.js"></script>
    </body>
    </html>
  `;
  };

  /**
   * Create handler for secured pages with token validation
   */
  const createSecuredHandler = (page: SecuredPage) => {
    return ({ query, set }: { query: any; set: any; request: Request }) => {
      // Handle token validation
      if (
        !query.token ||
        ((!query.fade || !query.direction) && page.path === "chat")
      ) {
        set.headers["Content-Type"] = "text/html";
        return generateTokenPromptHtml(page.path);
      }

      // Server-side token validation
      if (query.token !== token) {
        return new Response("Unauthorized", {
          status: 401,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // Token is valid, serve the requested page
      set.headers["Content-Type"] = "text/html";
      set.headers["Cache-Control"] = "no-store, no-cache, must-revalidate";

      // Fetch the default song for the music page
      const defaultSong = fetchDefaultSong();

      return renderPage({
        path: `${APP_DIR}/${page.path}.html`,
        pageName: page.title,
        stylesheet: `/css/${page.path}.css`,
        script: `/js/${page.path}.js`,
        excludeTailwind: page.excludeTailwind,
        excludeTemplate: page.excludeTemplate,
        replace: {
          "{{ songTitle }}": defaultSong.songTitle,
          "{{ songAuthor }}": defaultSong.songAuthor,
          "{{ songThumbnail }}": defaultSong.songThumbnail,
          "{{ songID }}": defaultSong.songID,
          "{{ fade }}": query.fade || "30",
          "{{ direction }}":
            query.direction === "ttb" ? "column-reverse" : "column",
        },
      });
    };
  };

  // Register API route for token validation
  app.post("/api/validate-token", ({ body, set }) => {
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
