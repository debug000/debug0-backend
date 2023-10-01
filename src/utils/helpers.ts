// Helper function to extract the repository name from a GitHub API URL
const extractRepoNameFromUrl = (url: string): string | null => {
  // The GitHub API URL format is typically https://api.github.com/repos/{owner}/{repo}
  const regex = /https:\/\/api\.github\.com\/repos\/([^/]+)\/([^/]+)/;
  const matches = url.match(regex);

  if (matches && matches.length >= 3) {
    const repoName = matches[2];
    return repoName;
  } else {
    return null;
  }
};

export { extractRepoNameFromUrl };
