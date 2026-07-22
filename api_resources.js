/**
 * MADLABZ AI Consulting - Backend API Module for AI Services Resource Library
 * Source: https://western-caravel-777.notion.site/Free-AI-Services-Resource-Library-3a34fd47b96f816fb37eda0bdb3f7444
 */

const resourcesDb = require('./resources_db.json');

/**
 * Get all available resources in the library
 */
function getAllResources() {
  return resourcesDb.resources;
}

/**
 * Filter resources by category
 * @param {string} category 
 */
function getResourcesByCategory(category) {
  if (!category || category === 'all') return getAllResources();
  return resourcesDb.resources.filter(r => 
    r.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * Search resources by keyword or tag
 * @param {string} query 
 */
function searchResources(query) {
  if (!query) return getAllResources();
  const q = query.toLowerCase();
  return resourcesDb.resources.filter(r => 
    r.title.toLowerCase().includes(q) ||
    r.description.toLowerCase().includes(q) ||
    r.tags.some(tag => tag.toLowerCase().includes(q))
  );
}

/**
 * Node.js HTTP / Vercel Serverless API Handler
 */
function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const category = url.searchParams.get('category');
  const query = url.searchParams.get('search');

  let results = getAllResources();

  if (category) {
    results = getResourcesByCategory(category);
  }
  if (query) {
    results = searchResources(query);
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 200;
  res.end(JSON.stringify({
    success: true,
    libraryTitle: resourcesDb.libraryTitle,
    total: results.length,
    resources: results
  }));
}

module.exports = {
  getAllResources,
  getResourcesByCategory,
  searchResources,
  handleApiRequest
};
