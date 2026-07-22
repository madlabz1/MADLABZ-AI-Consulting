const resourcesDb = require('../resources_db.json');

module.exports = (req, res) => {
  const { category, search } = req.query || {};

  let results = resourcesDb.resources;

  if (category && category !== 'all') {
    results = results.filter(r => 
      r.category.toLowerCase().includes(category.toLowerCase()) ||
      r.id.toLowerCase().includes(category.toLowerCase())
    );
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(r => 
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.tags && r.tags.some(tag => tag.toLowerCase().includes(q)))
    );
  }

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.status(200).json({
    success: true,
    title: resourcesDb.libraryTitle,
    total: results.length,
    resources: results
  });
};
