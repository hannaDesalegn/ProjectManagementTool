// Quick script to add default colors to existing boards
import prisma from './src/config/prisma.js';

async function updateBoardColors() {
    try {
        console.log('🎨 Updating board colors...');
        
        // Update all boards that don't have a color
        const result = await prisma.board.updateMany({
            where: {
                background_color: null
            },
            data: {
                background_color: '#8b5cf6' // Default purple
            }
        });
        
        console.log(`✅ Updated ${result.count} boards with default color`);
        
        // Show all boards with their colors
        const boards = await prisma.board.findMany({
            select: {
                id: true,
                name: true,
                background_color: true
            }
        });
        
        console.log('\n📋 All boards:');
        boards.forEach(board => {
            console.log(`  - ${board.name}: ${board.background_color}`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateBoardColors();
