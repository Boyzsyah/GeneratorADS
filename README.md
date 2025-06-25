
# AI Ad Concept Generator (AI Studio App)

This application allows you to generate professional ad concepts and video prompts from product images using AI. It's designed to be fast, intelligent, and creative.

## Run Locally

**Prerequisites:** Node.js (v18 or higher recommended)

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a file named `.env.local` in the root of your project. Add your Google Gemini API key to this file:
    ```
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    ```
    Replace `YOUR_GEMINI_API_KEY_HERE` with your actual API key.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:5173`.

## Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages using GitHub Actions.

**Steps to Deploy:**

1.  **Push to GitHub:**
    Ensure your local repository is committed and pushed to a GitHub repository.

2.  **Configure `GEMINI_API_KEY` Secret in GitHub:**
    *   In your GitHub repository, go to `Settings` > `Secrets and variables` > `Actions`.
    *   Click on `New repository secret`.
    *   Name the secret `GEMINI_API_KEY`.
    *   Paste your actual Gemini API key into the "Value" field.
    *   Click `Add secret`.
    *   **Security Note:** This API key will be embedded into your statically built JavaScript files. It is **CRITICAL** that you restrict this API key in your Google Cloud Console to only be usable from your specific GitHub Pages domain (e.g., `your-username.github.io`) and potentially the specific path if your app is in a subdirectory (e.g., `your-username.github.io/your-repository-name/*`). Failure to do so could lead to unauthorized use and unexpected charges.

3.  **Update `vite.config.ts` for Your Repository:**
    *   Open the `vite.config.ts` file in your project.
    *   Find the `base` variable configuration:
        ```javascript
        // IMPORTANT FOR GITHUB PAGES DEPLOYMENT:
        // 1. Replace 'YOUR_REPOSITORY_NAME' with your actual GitHub repository name.
        //    For example, if your repo URL is https://github.com/username/my-cool-app,
        //    then base should be '/my-cool-app/'.
        // 2. If you are deploying to a custom domain root (e.g., your-username.github.io or www.yourdomain.com)
        //    AND that domain points directly to this repository's GitHub Pages,
        //    then base should be '/'.
        const base = mode === 'production' ? '/YOUR_REPOSITORY_NAME/' : '/';
        ```
    *   Modify `'/YOUR_REPOSITORY_NAME/'` to match your GitHub repository's name (e.g., if your repository is `my-ad-generator`, change it to `'/my-ad-generator/'`).
    *   If you are deploying to `your-username.github.io` (i.e., a user/organization page, not a project page) or a custom domain that points to the root of your GitHub Pages site, set `base` to `'/'`.
    *   Commit and push this change.

4.  **Enable GitHub Pages:**
    *   In your GitHub repository, go to `Settings` > `Pages`.
    *   Under "Build and deployment", for "Source", select `GitHub Actions`.
    *   The workflow included (`.github/workflows/deploy.yml`) will automatically build and deploy your site.

5.  **Trigger Deployment:**
    *   Pushing any changes to your `main` branch (or whatever default branch is specified in the workflow) will automatically trigger the GitHub Action to build and deploy your application.
    *   You can monitor the progress in the `Actions` tab of your GitHub repository.

6.  **Access Your Deployed Site:**
    *   Once the action completes successfully, your site will be available at `https://<your-username>.github.io/<your-repository-name>/` (or your custom domain if configured). The exact URL will also be shown in the GitHub Pages settings and in the output of the deployment step in the GitHub Action log.

## Important Considerations & Limitations

*   **API Key Security:** As mentioned, your `GEMINI_API_KEY` is embedded in the client-side bundle. **Restrict your API key in the Google Cloud Console to your GitHub Pages domain.** This is the most critical security step.
*   **Static Site:** GitHub Pages hosts static sites. This means no server-side code (like traditional backend APIs or Node.js scripts) can run directly on GitHub Pages. Any backend functionality (e.g., Netlify functions if you were using Netlify) is not applicable here.
*   **Costs & API Usage:** You are responsible for any costs incurred from using the Google Gemini API. Monitor your usage in the Google Cloud Console.
*   **Rate Limits:** The Gemini API has usage quotas and rate limits. High traffic to your deployed site could potentially hit these limits.
*   **Build Process:** The GitHub Action handles the build. If the build fails, check the logs in the `Actions` tab on GitHub for error messages. Common issues include a missing or incorrect `GEMINI_API_KEY` secret or misconfiguration in `vite.config.ts`.
*   **Custom Domains:** If you configure a custom domain for your GitHub Pages site, remember to update the `base` path in `vite.config.ts` to `'/'` and follow GitHub's instructions for custom domain setup (DNS records, etc.).

This setup provides a streamlined way to deploy and share your AI Ad Concept Generator. Remember to prioritize API key security.
