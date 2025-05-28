const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.recommendShoes = async (req, res) => {
  const { footShape, volume } = req.body;
  try {
    const shoes = await prisma.shoe.findMany({
      include: { comfortRankings: true },
    });
    const recommended = shoes
      .map(shoe => {
        const scoreObj = shoe.comfortRankings.find(
          cr => cr.footShape === footShape && cr.volume === volume
        );
        return {
          ...shoe,
          comfortScore: scoreObj ? scoreObj.score : 3,
        };
      })
      .sort((a, b) => b.comfortScore - a.comfortScore);
    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.recommendShoes = async (req, res) => {
    const { footShape, volume } = req.body;
    try {
        const shoes = await prisma.shoe.findMany({
            include: { comfortRankings: true },
        });
        // ...rest of your logic...
        res.json(recommended);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};