/* 
    farm.js - Region 9 Farm Logic
    FIXES:
    1. Spawn point is now valid (Road extends to left).
    2. Exact coordinates for House/Field/Hub as requested.
    3. Proper River curves and collision logic.
*/
const Region9Farm = (function() {
    
    // --- Engine Constants ---
    const TILE = 50; 
    const MAP_S = 300; // <--- MUST MATCH INDEX.HTML 


// [THE MEAT] --- PASTE THIS NEW LINE HERE ---
    let hasShownJoke = false;
// ------------------------------------------


    let S;//let handleInput = function(e) {}; // Placeholder to prevent crash
    // ------------------------------



// --- PASTE THIS NEW LINE ---
    // White, Soft Red, Soft Blue, Soft Green, Soft Yellow, Soft Purple, Concrete Grey
    const BRICK_COLS = ['#f5f5f5', '#ef5350', '#42a5f5', '#66bb6a', '#ffee58', '#ab47bc', '#bdbdbd'];




// --- NEW: BLOCKED ROCKY PATCH COORDINATES ---
   // --- NEW: BLOCKED ROCKY PATCH COORDINATES (Updated V2) ---
    const PATCH_TILES = new Set([
        // 1. LEFT SIDE (213-221)
        "220,120","221,120",
        "220,121","221,121",
        "218,122","219,122","220,122",
        "218,123","219,123","220,123",
        "218,124","219,124",
        "214,125","215,125","216,125","217,125","218,125","219,125",
        "214,126","215,126","216,126","217,126",
        "213,127","214,127","215,127",
        "213,128","214,128",
        "213,129",

        // 2. RIGHT SIDE (273-276)
        "273,120","274,120",
        "273,121","274,121",
        "273,122","274,122",
        "274,123","275,123",
        "274,124","275,124",
        "274,125","275,125","276,125"
    ]);





    // Added SAND: 3 to match index.html
    const T = { WATER:0, GRASS:1, FOREST:2, SAND:3, ROAD:9, BEDROCK:12, BLOCK:13, SOIL: 50 };
    const C = { 
        WATER:'#4fc3f7', GRASS:'#2e7d32', FOREST:'#1b5e20', 
        ROAD:'#78909c', BEDROCK:'#111', BLOCK:'#000', SOIL: '#5d4037'
    };


////////////////////////
// --- TUTORIAL DATA ---
   // --- TUTORIAL DATA (Revised) ---
   // --- 12-STEP TUTORIAL DATA ---
    const TUTORIAL_STEPS = [
        { txt: "1. INTERACT: Walk to Dog. Press <span style='color:#ffd700'>[SPACE]</span>. Select 'Pet'.", target: 'dog' },
       { txt: "2. CLEAR: Farm is messy! Use <span style='color:#ffd700'>Sickle, Hammer, or Axe</span> to clear debris.", target: 'debris' },
        { txt: "3. TILL: Select <span style='color:#ffd700'>Hoe [2]</span>. <span style='color:#ffd700'>[SPACE]</span> on grass to make Soil.", target: 'grass' },
        { txt: "4. SUPPLIES: That <span style='color:#ff5252'>Red Booth</span> is the Shop! Go there & <span style='color:#ffd700'>[SPACE]</span> to buy Seeds.", target: 'Telebooth' },
        { txt: "5. BAG: Press <span style='color:#ffd700'>[~]</span>. Select Seeds. <span style='color:#ffd700'>[SPACE]</span> to Hold.", target: 'player' },
        { txt: "6. PLANT: With Seeds in hand, <span style='color:#ffd700'>[SPACE]</span> on the Soil.", target: 'soil' },
        { txt: "7. WATER: Select <span style='color:#ffd700'>Can [W]</span>. <span style='color:#ffd700'>[SPACE]</span> on crop.", target: 'crop' },
        { txt: "8. REFILL: Water low! Go to Stone Well & <span style='color:#ffd700'>[SPACE]</span>.", target: 'Well' },
        { txt: "9. SLEEP: Enter House. Click Bed to Sleep. (Crops grow!)", target: 'FarmHouse' },
        { txt: "10. HARVEST: It grew! Select <span style='color:#ffd700'>Hand [1]</span>. <span style='color:#ffd700'>[SPACE]</span> to Pick.", target: 'grown_crop' },
        { txt: "11. SELL: Go to Wooden Bin outside. <span style='color:#ffd700'>[SPACE]</span> to Sell.", target: 'ShippingBin' },
        { txt: "12. DECORATE: Open Bag <span style='color:#ffd700'>[~]</span>. Hold Timber. Place it.", target: 'player' }
    ];















/////////////////////////


// --- SHOP DATA (Parchment Theme Edition) ---
    // 1. UPDATED TABS LIST
    const TABS = ["SEEDS", "ANIMALS", "UPGRADE", "DECOR"];

    const SHOP_DATA = [
        // Tab 0: SEEDS
        [
            { name: "Carrot Seeds", price: 10, id: 'carrot_seeds', icon: '🥕', desc: 'Fast growing root.' }, 
            { name: "Potato Seeds", price: 20, id: 'potato_seeds', icon: '🥔', desc: 'Hearty staple.' },
            { name: "Corn Seeds",   price: 30, id: 'corn_seeds', icon: '🌽', desc: 'Summer favorite.' },
            { name: "Tomato Seeds", price: 30, id: 'tomato_seeds', icon: '🍅', desc: 'Juicy and red.' },
            { name: "Rose Seeds",   price: 40, id: 'rose_seeds', icon: '🌹', desc: 'Romantic red.' },
            { name: "Sunflr Seeds", price: 40, id: 'sunflower_seeds', icon: '🌻', desc: 'Follows the sun.' },
            { name: "Tulip Seeds",  price: 40, id: 'tulip_seeds', icon: '🌷', desc: 'Spring classic.' },
            { name: "Lav. Seeds",   price: 40, id: 'lavender_seeds', icon: '🪻', desc: 'Calming scent.' }
        ],
        
       // Tab 1: ANIMALS
        [
            { name: "Chicken", price: 500, id: 'chicken', type: 'animal', icon: '🐔', desc: 'Lays eggs daily.' },
            { name: "Cow", price: 1500, id: 'cow', type: 'animal', icon: '🐮', desc: 'Produces milk.' },
            { name: "Cat", price: 2000, id: 'cat', type: 'pet', icon: '🐱', desc: 'Independent friend.' },
            // NEW: HORSE
            { name: "Horse", price: 5000, id: 'horse', type: 'animal', icon: '🐎', desc: 'Ride for speed!' }
        ],
        
        // Tab 2: UPGRADE (House, Field, Tools)
        [
            { name: "House Upgrade", price: 2000, type: 'house', icon: '🏠', desc: 'Expand your home.' }, 

// --- NEW: GARDEN EXPAND ---
            { name: "Garden Expand", price: 500, type: 'garden', icon: '🌻', desc: 'Bigger flower plot.' },
            
            // --- EXISTING: FIELD EXPAND ---
            { name: "Field Expand", price: 1000, type: 'field', icon: '🚜', desc: 'More land for crops.' },
            { name: "Up Hoe", price: 500, id: 'hoe', type: 'tool', icon: '⛏️', desc: 'Till 3 tiles.' }, 
            { name: "Up Sickle", price: 500, id: 'sickle', type: 'tool', icon: '✂️', desc: 'Cut weeds faster.' },
            { name: "Up Axe", price: 2000, id: 'axe', type: 'tool', icon: '🪓', desc: 'Chop stumps.' },
            { name: "Up Hammer", price: 2000, id: 'hammer', type: 'tool', icon: '🔨', desc: 'Smash boulders.' },
            { name: "Up Can", price: 2000, id: 'water', type: 'tool', icon: '🚿', desc: 'Water 3 tiles.' }
        ],

        // Tab 3: DECOR
        [
            { name: "Timber", price: 50, id: 'wood', type: 'item', icon: '🪵', desc: 'Building material.' }, 
            { name: "Brick", price: 20, id: 'brick', type: 'item', icon: '🧱', desc: 'Construction block.' },
            { name: "Letter Brick", price: 50, id: 'letter_brick', type: 'item', icon: '🔠', desc: 'Write messages!' },
            { name: "Star", price: 200, id: 'star', type: 'item', icon: '⭐', desc: 'Shiny gold star.' },
            { name: "Red Balloon", price: 100, id: 'bal_r', type: 'item', icon: '🎈', desc: 'Floats in air.' },
            { name: "Yel Balloon", price: 100, id: 'bal_y', type: 'item', icon: '🎈', desc: 'Floats in air.' },
            { name: "Blue Balloon", price: 100, id: 'bal_b', type: 'item', icon: '🎈', desc: 'Floats in air.' },
            { name: "Teddy Bear", price: 300, id: 'teddy', type: 'item', icon: '🧸', desc: 'Cuddly toy.' },
            { name: "Question Box", price: 150, id: 'qbox', type: 'item', icon: '❓', desc: 'Mystery block.' },
            { name: "Big Coin", price: 150, id: 'coin', type: 'item', icon: '🪙', desc: 'Shiny decoration.' }
        ]
    ];






///////
    // --- State Object ---
    // --- State Object (Updated Tools & Icons) ---

///////////////////////////
   // [CHUNK 1] Updated State Object
   // [CHUNK 1] Updated State Object (Fixed: Shop + Bag)
    // [CHUNK 1] Updated State Object
   

/////////////////////////

    let cvs, ctx;

    // --- Initialization (With Container & Grid Logic) ---

///////////////////////////////
   // --- Initialization (Bigger UI & Remove EXP) ---
   
// --- Initialization ---
   // --- Initialization ---
    // --- Initialization ---
    function init(mainState) {
        S = mainState; 

// [THE MEAT] --- PASTE THIS NEW LINE HERE ---
        hasShownJoke = false;
// ------------------------------------------




        // [END PASTE]
























        // Initialize UI State
        S.ui = 'none';
        S.shop = { tab: 0, sel: 0 };
        S.bag = { tab: 0, cx: 0, cy: 0, actionOpen: false };

        console.log("Region 9 Farm: Connected.");

        cvs = document.getElementById('cvs');
        ctx = cvs.getContext('2d');

        // Initialize Farm Data
        ['debris', 'plots', 'fences', 'structures', 'letterData'].forEach(k => {
            if (!S.farm[k]) S.farm[k] = {};
        });

        // Merge Inventory defaults
        const farmItems = {
            wood: 0, stake: 0, fish: 0, brick: 0,
            carrot: 0, potato: 0, corn: 0, tomato: 0,
            carrot_seeds: 5, potato_seeds: 0, corn_seeds: 0, tomato_seeds: 0,
            rose: 0, sunflower: 0, tulip: 0, lavender: 0,
            rose_seeds: 0, sunflower_seeds: 0, tulip_seeds: 0, lavender_seeds: 0,
            milk: 0, egg: 0, apple: 0, orange: 0,
            letter_brick: 0, star: 0, teddy: 0, qbox: 0, coin: 0,
            bal_r: 0, bal_y: 0, bal_b: 0
        };
        S.farm.inventory = { ...farmItems, ...S.farm.inventory };





// [THE MEAT] --- PASTE THIS NEW LINE HERE ---
        // Reset the joke counter so you can see it again if you refresh
        S.farm.fishSpam = 0; 




        // [FIX] ONLY GENERATE MAP ONCE
        // If we don't check this, every time you enter, it spawns more trees on top of old ones.
        if (!S.farm.generated) {
            generateRegion9();
            S.farm.generated = true; // Mark as done
        }


// --- FIX: SPAWN BOAT IF MISSING ---
        // --- FIX: SMART BOAT SPAWN ---
        // Only spawn a boat if one does not exist AND the player isn't currently sailing one.
        let boatExists = S.ents.find(e => e.kind === 'boat');
        if (!boatExists && !S.p.isBoating) {
            // Spawn at default dock location
            addEnt('vehicle', 'boat', 186, 139);
        }






// --- PASTE START ---
        // --- FIX: PALM TREES V5 (Force Retry) ---
        if (!S.farm.has_coconuts_v5) {
            console.log("Applying Beach V5 (Diagonal C-Shape)...");
            
            // 1. Cleanup Old Trees
            S.ents = S.ents.filter(e => e.kind !== 'tree_coconut');

            // 2. Mark Occupied Tiles (Water=0, Road=9, Bedrock=12)
            let taken = new Set();
            // Scan Map for bad tiles
            for (let y = 115; y < 165; y++) {
                for (let x = 150; x < 200; x++) {
                    let t = S.map[y * 300 + x];
                    if (t === 0 || t === 12 || t === 9) taken.add(`${x},${y}`);
                }
            }
            // Scan Entities
            S.ents.forEach(e => {
                for(let dy=0; dy<e.h; dy++) for(let dx=0; dx<e.w; dx++) {
                    taken.add(`${Math.round(e.x)+dx},${Math.round(e.y)+dy}`);
                }
            });

            // 3. Plant Logic
            let count = 0;
            let attempts = 0;
            while (count < 80 && attempts < 5000) {
                attempts++;
                let tx = Math.floor(155 + Math.random() * 40); 
                // Random Y band (Top or Bottom)
                let ty = (Math.random() < 0.5) ? Math.floor(120 + Math.random() * 18) : Math.floor(142 + Math.random() * 18);

                // Diagonal Cut Logic
                let relX = tx - 155; 
                let slope = 0.5;
                if (ty < 140 && ty > 136 - (relX * slope)) continue; // Top Cut
                if (ty > 140 && ty < 144 + (relX * slope)) continue; // Bottom Cut

                // Check 3x3 Area for Safety
                let safe = true;
                for(let cy=ty; cy<ty+3; cy++) for(let cx=tx; cx<tx+3; cx++) {
                    if (taken.has(`${cx},${cy}`)) safe = false;
                }

                if (safe) {
                    // Manually add entity to avoid scope issues with addEnt helper
                    S.ents.push({ type: 'env', kind: 'tree_coconut', x: tx, y: ty, w: 3, h: 3 });
                    
                    // Mark as taken
                    for(let cy=ty; cy<ty+3; cy++) for(let cx=tx; cx<tx+3; cx++) taken.add(`${cx},${cy}`);
                    count++;
                }
            }
            console.log("V5: Planted " + count + " trees.");
            S.farm.has_coconuts_v5 = true; 
        }
// --- PASTE END ---







        // Setup DOM/CSS
        let gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            gameContainer = document.createElement('div');
            gameContainer.id = 'game-container';
            gameContainer.style.position = 'relative';
            gameContainer.style.display = 'inline-block';
            if(cvs.parentNode) cvs.parentNode.insertBefore(gameContainer, cvs);
            gameContainer.appendChild(cvs);
        }

        if (!document.getElementById('farm-styles')) {
            let style = document.createElement('style');
            style.id = 'farm-styles';
            style.innerHTML = `
                #skill-bar { position: absolute; top: 70px; left: 10px; display: grid; grid-template-columns: 70px 60px 60px 60px 60px; grid-template-rows: 60px 60px; gap: 6px; z-index: 100; }
                .slot-base { background: rgba(30, 30, 30, 0.8); border: 3px solid #8d6e63; border-radius: 8px; box-sizing: border-box; display: flex; justify-content: center; align-items: center; cursor: pointer; color: white; position: relative; }
                .slot-base:hover { border-color: #ffd700; background: rgba(60, 60, 60, 0.9); }
                .bag-slot { grid-column: 1; grid-row: 1 / span 2; flex-direction: column; }
                .active-tool { border: 3px solid #ffd700; background: rgba(255, 215, 0, 0.25); box-shadow: 0 0 8px #ffd700; }
                #space-hint { position: absolute; bottom: 20px; left: 20px; width: 100px; height: 100px; background: rgba(62, 39, 35, 0.9); border: 5px solid #fff; border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center; box-shadow: 0 6px 12px rgba(0,0,0,0.6); z-index: 99; }
                #space-icon { font-size: 50px; margin-bottom: 2px; }
                #space-text { font-size: 18px; color: #ffd700; font-family: monospace; font-weight: bold; }
               





 #screen-hint { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 28px; color: white; text-shadow: 2px 2px 0 #000; pointer-events: none; opacity: 0; transition: opacity 0.5s; z-index: 200; }
                
                /* NEW CHAT BOX STYLES */
                /* TOP CENTER BANNER - Always visible, never off-screen */




/* UPDATED CHAT POSITION */
                #rpg-chat { 
                    position: absolute; 
                    bottom: 130px; /* <--- CHANGED FROM 20px TO 130px */
                    left: 50%; 
                    transform: translateX(-50%); 
                    width: 400px; 
                    background: #4e342e; 
                    border: 4px solid #8d6e63; 
                    border-radius: 6px; 
                    padding: 10px; 
                    opacity: 0; 
                    transition: opacity 0.5s; 
                    z-index: 200; 
                    pointer-events: none; 
                    box-shadow: 0 6px 0 #271c19, 0 10px 10px rgba(0,0,0,0.5); 
                    display: flex; 
                    flex-direction: column; 
                    align-items: center; 
                }




               /* [THE MEAT] --- PASTE THIS (New Font & Size) --- */
                #chat-name { 
                    color: #ffd700; 
                    font-family: Verdana, sans-serif; /* <--- CLEANER FONT */
                    font-weight: bold; 
                    font-size: 20px; 
                    margin-bottom: 8px; 
                    text-transform: uppercase; 
                    text-shadow: 1px 1px 0 #000;
                    border-bottom: 1px dashed #6d4c41;
                    width: 100%;
                    text-align: center;
                    padding-bottom: 5px;
                }
                #chat-text { 
                    color: #fff3e0; 
                    font-family: Verdana, sans-serif; /* <--- CLEANER FONT */
                    font-weight: bold; /* Make the joke easier to read */
                    font-size: 24px; 
                    line-height: 1.4; 
                    text-align: center;
                    text-shadow: 2px 2px 0 #000;
                }





                }
            `;









            document.head.appendChild(style);
        }
        





       // Added 'rpg-chat' to this list
        ['space-hint', 'screen-hint', 'rpg-chat'].forEach(id => {
             if(!document.getElementById(id)) {
                 let d = document.createElement('div'); d.id=id;
                 
                 if(id==='space-hint') d.innerHTML = `<div id="space-icon">✋</div><div id="space-text">SPACE</div>`;
                 
                 // Create the Chat Box structure
                 if(id==='rpg-chat') d.innerHTML = `<div id="chat-name"></div><div id="chat-text"></div>`;
                 
                 gameContainer.appendChild(d);
             }
        });






        if(!S.ents.find(e => e.type === 'pet')) addEnt('pet', 'dog', 132, 133);
        updateFarmUI();







       // [REPLACE WITH THIS V27 CODE]
        // --- FIX: SEA ROCKS V27 (Group 3 Organic Shore) ---
      // --- FIX: SEA ROCKS V27 (Group 3 Organic Shore) ---
        if (!S.farm.has_sea_rocks_v27) {
            console.log("Applying Sea Rocks V27 (Fixed Spacing)...");

            // 1. Cleanup Old Rocks
            S.ents = S.ents.filter(e => {
                if (e.kind === 'sea_rock') return false; 
                // Keep the specific boulders we want to keep
                if (e.kind === 'boulder' && e.x >= 160 && e.x <= 230 && e.y < 135) return false;
                if (e.kind === 'boulder' && e.x >= 250 && e.x <= 300) return false;
                if (e.kind === 'boulder' && e.x >= 170 && e.x <= 220 && e.y >= 140) return false;
                return true;
            });

            // ---------------------------------------------------------
            // HELPER: Spawn Row (With Overlap Protection)
            const spawnRow = (y, startX, limitX, forceSolidRow) => {
                let sx = Math.floor(startX);
                let lx = Math.floor(limitX);

                // We use a while loop or manually increment x inside the for loop
                for (let x = sx; x <= lx; x++) {
                    

// [FIX] DO NOT SPAWN ROCKS ON PATCH TILES
                    if (PATCH_TILES.has(`${x},${y}`)) continue;




                    // Bedrock Wall Logic (Visual only, doesn't spawn entity)
                    if (y === 120 && x <= 199) { 
                        S.map[y * 300 + x] = 12; 
                        continue; 
                    }

                    S.map[y * 300 + x] = 0; // Set to Water

                    // Border Calculation
                    let isEdgeX = (x <= sx + 2 || x >= lx - 2);
                    let density = 0.25; 
                    if (isEdgeX || y === 120 || forceSolidRow) density = 0.90; // Higher chance, but not guaranteed

                    // ROLL FOR SPAWN
                    if (Math.random() < density) {
                        
                        // 1. Calculate random size
                        let w = 2 + Math.floor(Math.random() * 2); // Width 2 or 3
                        let h = 2 + Math.floor(Math.random() * 2); // Height 2 or 3
                        
                        // CLAMP 1: Width (Don't go past the limit)
                        if (x + w - 1 > lx) w = (lx - x) + 1;

                        // CLAMP 2: Height (Stop at 160)
                        if (y + h > 160) h = 160 - y;

                        if (w >= 1 && h >= 1) {
                            addEnt('obs', 'sea_rock', x, y);
                            let r = S.ents[S.ents.length-1];
                            r.w = w; 
                            r.h = h;
                            
                            // *** THE FIX IS HERE ***
                            // Skip the iterator 'x' forward by the width of this rock.
                            // If rock is width 3, we skip 2 extra spaces (since loop does x++)
                            // This prevents the NEXT rock from spawning inside THIS rock.
                            x += (w - 1); 
                        }
                    }
                }
            };
            // ---------------------------------------------------------

            // GROUP 1: TOP LEFT (Start 120, End 129)
            for (let y = 120; y <= 129; y++) {
                let sX = 179 + (y - 120) * 1.5; 
                if (y === 120) sX = 179;
                let eX = 221 + (y - 120) * -1.375;
                spawnRow(y, sX, eX, (y === 129));
            }

            // GROUP 2: RIGHT (Fennel Shape: 273 -> 284 -> 273)
            for (let y = 120; y <= 159; y++) {
                
                // 1. Calculate Sine Curve (0.0 -> 1.0 -> 0.0)
                let normY = (y - 120) / 39; 
                let curve = Math.sin(normY * Math.PI); 
                
                // 2. Define Start X
                // Base: 273. Max expansion: +11 tiles (Reaches 284)
                let sX = 273 + (curve * 11); 
                
                let eX = 293;
                spawnRow(y, sX, eX, (y === 159));
            }

            // GROUP 3: BOTTOM LEFT (150 to 158)
            for (let y = 150; y <= 158; y++) {
                // Organic Curve: Base 180 + Sine Wave offset (-5 to +5)
                let sX = 180 + Math.sin((y - 150) * 0.8) * 5;
                let eX = 180 + (y - 150) * 3.75;
                if (sX >= eX) sX = eX - 2;
                spawnRow(y, sX, eX, (y === 158));
            }

            S.farm.has_sea_rocks_v27 = true;
        }







    }

    // --- Input Handling ---
    const handleInput = e => {
        let key = e.key.toLowerCase();
        let code = e.code;
// --- 1. SHOP INPUT ---
            if (S.ui === 'shop') {
                e.preventDefault();
                if (code === 'Escape') {
                    S.ui = 'none';
                    S.audio.play('esc'); // <--- PLAY HERE
                }
		else if (code === 'Backquote') { toggleBag(); }

                else if (code === 'ArrowRight') { S.audio.play('menu_tab'); S.shop.tab = (S.shop.tab + 1) % TABS.length; S.shop.sel = 0; }
                else if (code === 'ArrowLeft') { S.audio.play('menu_tab'); S.shop.tab = (S.shop.tab - 1 + TABS.length) % TABS.length; S.shop.sel = 0; }
                else if (code === 'ArrowDown') { S.audio.play('menu_scroll'); if (S.shop.sel < SHOP_DATA[S.shop.tab].length - 1) S.shop.sel++; }
                else if (code === 'ArrowUp') { S.audio.play('menu_scroll'); if (S.shop.sel > 0) S.shop.sel--; }



                else if (code === 'Space') {
                    let item = SHOP_DATA[S.shop.tab][S.shop.sel];
                    
                    // CALL FUNCTIONS DIRECTLY (Removed 'Region9Farm.' prefix)
                    if (item.type === 'house') upgradeHouse(item.price);
                    else if (item.type === 'field') upgradeField(item.price);
                    else if (item.type === 'garden') upgradeGarden(item.price);
                    else if (item.type === 'tool') buy(item.id, item.price); // Redirect tool to buy
                    else buy(item.id, item.price);
                }
                return;
            }


        // 2. BAG
        if (S.ui === 'bag') { 
            e.preventDefault(); 
            const MAX_TABS = 3; 
            if (code === 'Escape' || code === 'Backquote') { toggleBag(); }


            else if (code === 'ArrowRight') { 
                if(S.bag.cx === 3) { S.audio.play('menu_tab'); S.bag.tab = (S.bag.tab + 1) % MAX_TABS; S.bag.cx = 0; } 
                else { S.audio.play('menu_scroll'); S.bag.cx = (S.bag.cx + 1) % 4; }
            }
            else if (code === 'ArrowLeft') { 
                if(S.bag.cx === 0) { S.audio.play('menu_tab'); S.bag.tab = (S.bag.tab - 1 + MAX_TABS) % MAX_TABS; S.bag.cx = 3; } 
                else { S.audio.play('menu_scroll'); S.bag.cx = (S.bag.cx - 1 + 4) % 4; }
            }
            else if (code === 'ArrowDown') { S.audio.play('menu_scroll'); S.bag.cy = (S.bag.cy + 1) % 5; }
            else if (code === 'ArrowUp') { S.audio.play('menu_scroll'); S.bag.cy = (S.bag.cy - 1 + 5) % 5; }



            else if (code === 'Space') { 
                let item = getBagItemAt(S.bag.tab, S.bag.cx, S.bag.cy);
                if(item) {
                    // LIST OF ITEMS THAT CANNOT BE HELD/PLACED
                    // (Flowers are excluded here so you can still place them)
                    const blocked = ['carrot','potato','corn','tomato','apple','orange','fish','egg','milk'];

                    if (blocked.includes(item.id)) {
                        // Action Blocked
                        S.audio.play('error');
                    } else {
                        // Open Menu for Seeds, Flowers, Decor
                        S.audio.play('btn_click');
                        S.ui = 'bag_opt'; 
                        S.menuSel = 0; 
                    }
                }
            }
            return; 
        }

        // 3. LETTER EDIT
        // 3. LETTER EDIT
        if (S.ui === 'letter_edit') {
            e.preventDefault();
            let k = `${S.menuTarget.x},${S.menuTarget.y}`;
            let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let data = S.farm.letterData[k] || { char: 'A', col: 0 };
            let charIdx = letters.indexOf(data.char); if (charIdx === -1) charIdx = 0;
            let colIdx = data.col || 0;

            // --- ADD AUDIO HERE ---
            if (['ArrowRight','ArrowLeft','ArrowUp','ArrowDown'].includes(code)) {
                S.audio.play('menu_scroll'); 
            }

            if (code === 'ArrowRight') charIdx = (charIdx + 1) % letters.length;
            else if (code === 'ArrowLeft') charIdx = (charIdx - 1 + letters.length) % letters.length;
            else if (code === 'ArrowUp') colIdx = (colIdx + 1) % BRICK_COLS.length;
            else if (code === 'ArrowDown') colIdx = (colIdx - 1 + BRICK_COLS.length) % BRICK_COLS.length;
           S.farm.letterData[k] = { char: letters[charIdx], col: colIdx };
            // --- THE FIX ---
            if (code === 'Space' || code === 'Enter' || code === 'Escape') {
                
                // Audio Logic
                if (code === 'Escape') S.audio.play('esc'); 
                else S.audio.play('btn_click'); // Confirm sound for Enter/Space

                S.ui = 'none';
                updateFarmUI(); // Restore the Hotkeys/UI
            }
            // ----------------
            // ----------------

            return; // <--- KEEP THIS! Stops the key from triggering player tools.
        }

        // 4. MENUS
        // 4. MENUS
        // Added 'fire_opt' to this list so the game freezes the player and lets you select options
        if (['bag_opt','item_opt','sleep_opt','chicken_opt','cow_opt','pet_opt','horse_opt','boat_opt', 'fire_opt'].includes(S.ui)) {
            e.preventDefault();
            let max = 2;
            if (S.ui === 'pet_opt') max = 4;
            else if (S.ui === 'cow_opt' || S.ui === 'horse_opt') max = 3;
            else if (S.ui === 'item_opt') {
                let k = `${S.menuTarget.x},${S.menuTarget.y}`;
                if (S.farm.structures[k] === 'letter_brick') max = 4; else max = 3;
            }





            if (code === 'ArrowUp') { S.audio.play('menu_scroll'); S.menuSel = (S.menuSel - 1 + max) % max; }
            if (code === 'ArrowDown') { S.audio.play('menu_scroll'); S.menuSel = (S.menuSel + 1) % max; }

            // 1. ESCAPE (Cancel)
            if (code === 'Escape') { 
                S.audio.play('esc'); 
                if (S.ui === 'bag_opt') {
                    S.ui = 'bag'; // Back to Bag Grid
                } else {
                    S.ui = 'none'; // Close Menu completely
                    updateFarmUI(); // Restore UI Bars
                }
            }

            // 2. BACKQUOTE (Jump to Bag)
            if (code === 'Backquote') {
                S.audio.play('bag');
                S.ui = 'bag'; // Force Bag Mode
                S.bag.cx = 0; S.bag.cy = 0; // Reset Cursor
                updateFarmUI(); // Ensure UI Bars are hidden
            }

            if (code === 'Space') handleMenuAction();






            return;
        }

        // 5. GAMEPLAY
        S.input.keys[key] = true;
        if(code === 'Space') {
            interact();
            let sh = document.getElementById('space-hint');
            if(sh) { sh.style.transform = 'scale(0.9)'; sh.style.borderColor = '#ffd700'; }
        }
        const keyToTool = { '1':0, '2':1, '3':2, '4':3, 'q':4, 'w':5, 'e':6, 'r':7 };
       if(keyToTool.hasOwnProperty(key)) {
            if (S.carry) { S.farm.inventory[S.carry.id]++; S.carry = null; popText(S.p.x, S.p.y, "Canceled", "#aaa"); }
            
            S.farm.toolIndex = keyToTool[key];
            
            // USE THE NEW KEY HERE:
            S.audio.play('tool_swap'); 
            
            updateFarmUI();
        }
        if(code === 'Backquote') { e.preventDefault(); toggleBag(); }
        if(code === 'Escape') {
            e.preventDefault();
            if (S.carry) { 
                S.farm.inventory[S.carry.id]++; 
                popText(S.p.x, S.p.y, "Returned", "#fff"); 
                
                S.audio.play('esc'); // <--- USE ESC HERE (Instead of pop)
                
                S.carry = null; 
            }
            else if(S.farm.toolIndex !== 0) { S.farm.toolIndex = 0; updateFarmUI(); showHint("Hand Mode"); }
        }
    };


//////////////////////////////
function generateRegion9() {
        console.log("Generating Region 9...");
        //S.map = new Uint8Array(MAP_S * MAP_S).fill(T.BEDROCK); 
        //S.ents = []; 
        S.farm.plots = {}; S.farm.debris = {}; S.farm.fences = {}; S.farm.letterData = {};


// --- [ADD THIS SECTION] 0. FILL VOID (Fixes Blue Minimap) ---
        // Overwrite the default Water (0) with Bedrock (12) for the whole region area
        for (let y = 100; y < MAP_S; y++) {
            for (let x = 115; x < MAP_S; x++) {
                S.map[y * MAP_S + x] = T.BEDROCK;
            }
        }
        // -------------------------------------------------------------


        // --- 1. COLLISION TRACKER (The Fix) ---
        // We track occupied tiles here so trees don't spawn on top of each other
        let taken = new Set();

        // Region Boundaries
        // fw (width) increased from 40 to 80
        // --- 1. DEFINE EXACT ZONES (Total Width = 80) ---
        let fx = 120, fy = 120, fh = 40;
        
        // The Zone Widths
        let w_farm   = 40; // 0-39
        let w_buffer = 10; // 40-49
        let w_beach  = 8;  // 50-57
        let w_hybrid = 4;  // 58-61 (Wave Zone)
        let w_ocean  = 58; // 62-119
        
        let fw = 120; // Total Width












        

       // --- 2. BASE LANDSCAPE & TREES ---
        for (let y = fy; y < fy + fh; y++) {
            
            // [NEW] GENTLER CURVE LOGIC
            // 1. Calculate Curve (0.0 to 1.0)
            let normY = (y - 120) / 40;
            
            // 2. Amplitude reduced to 6 (Was 12/14)
            // This prevents it from cutting too deep into the land
            let curveOffset = Math.sin(normY * Math.PI) * 6; 

            // 3. Push Ocean further right (Base 70, minus curve)
            // At the deepest point, ocean starts at relative X = 64
            let limitOcean = 70 - curveOffset; 
            
            // 4. WIDER SAND (Fixed 10 tiles wide)
            // Sand starts 10 tiles before the ocean line
            let limitBeach = limitOcean - 10; 

            for (let x = fx; x < fx + fw; x++) {
                
                let t = T.GRASS;
                let k = `${x},${y}`;
                let relX = x - 120; // 0 to 79

                // === ZONE 1: FARM & RIVER (0-39) ===
                if (relX < 40) {
                    t = T.GRASS;
                    // Road
                    if (y >= 134 && y <= 138) t = T.ROAD;
                    // River
                    // River
                    if (x >= 135 && x <= 155) {
                        let center;

                        // 1. TOP CURVE (Before Bridge)
                        if (y < 131) {
                            center = Math.floor(144 + Math.sin((y - 120) / 8) * 3);
                        }
                        // 2. STRAIGHT BRIDGE SECTION (Fixed at 147)
                        else if (y >= 131 && y <= 142) {
                            center = 147;
                        }
                        // 3. TRANSITION (Your Old Code - Smooth Diagonal)
                        else if (y === 143) center = 146;
                        else if (y === 144) center = 145;
                        else if (y === 145) center = 144;
                        // 4. BOTTOM CURVE (After Bridge)
                        else {
                            center = Math.floor(144 + Math.sin((y - 120) / 8) * 3);
                        }

                        // 5. DRAW EXACTLY 4 TILES WIDE
                        // [Center-1, Center, Center+1, Center+2]
                        if (x >= center - 1 && x <= center + 2 && t !== T.ROAD) {
                            t = T.WATER;
                            taken.add(k);
                        }
                    }
                }
                // === ZONE 2: BUFFER (Grass) ===
                else if (relX < limitBeach) {
                    t = T.GRASS;
                }
                // === ZONE 3: BEACH (Sand) ===
                else if (relX < limitOcean) {
                    t = T.SAND;
                }
                // === ZONE 4: OCEAN (Water) ===
                else {
                    t = T.WATER;
                    taken.add(k); // Block walking
                }

                // --- WALLS ---
                // --- WALLS ---
                if (y === 120) { t = T.BEDROCK; taken.add(k); } // Top Wall (Always Bedrock)
                
                // Bottom Wall (159): Only make it Bedrock if it's Land. Keep Water as Water.
                if (y === 159 && t !== T.WATER && t !== T.SAND) { 
                    t = T.BEDROCK; taken.add(k); 
                }
                if (x === 120 && t !== T.ROAD) { t = T.BEDROCK; taken.add(k); }
                

                S.map[y * MAP_S + x] = t;

                // --- TREES (Only on Grass Buffer) ---
                let inTop = (y >= 121 && y <= 123);
                let inBtm = (y >= 155 && y <= 158);
                if ((inTop || inBtm) && t === T.GRASS && !taken.has(k)) {
                    if (Math.random() < 0.3) {
                         addEnt('env', 'tree_f', x, y);
                         taken.add(k);
                    }
                }
            }
        }



// ... inside generateRegion9, AFTER the main nested loops for (y=fy... and x=fx...)
        
        // --- [NEW] EXTEND OCEAN TO WORLD EDGE ---
        // Overwrite the default Bedrock with Water from x=200 to x=299
        // --- [NEW] EXTEND OCEAN TO WORLD EDGE ---
// Range: x=200 to x=299. 
// STOP at 159 to keep the bottom wall solid.
// --- [NEW] EXTEND OCEAN TO WORLD EDGE ---
        // Range: x=200 to x=299. 
        // We use <= 159 to make the bottom edge Water instead of Bedrock
        for (let y = 120; y <= 159; y++) { 
            for (let x = 200; x < 300; x++) {
                S.map[y * MAP_S + x] = T.WATER;
            }
        }


        

        // --- 3. OBSTACLES (Uses same 'taken' set) ---
        
        // A. 2x2 Obstacles (Boulders & Stumps)
        for (let y = 141; y < 149; y++) { 
             for (let x = 124; x < 136; x++) {
                 let k1=`${x},${y}`, k2=`${x+1},${y}`, k3=`${x},${y+1}`, k4=`${x+1},${y+1}`;
                 
                 if(!taken.has(k1) && !taken.has(k2) && !taken.has(k3) && !taken.has(k4)) {
                     if(Math.random() < 0.05) { 
                         let type = Math.random() < 0.5 ? 'boulder' : 'stump';
                         addEnt('obs', type, x, y); 
                         taken.add(k1); taken.add(k2); taken.add(k3); taken.add(k4);
                     }
                 }
             }
        }

        // B. 1x1 Debris (Stones, Branches, Weeds)
        for (let y = 141; y <= 150; y++) {
            for (let x = 124; x <= 137; x++) {
                let k = `${x},${y}`;
                if (!taken.has(k)) {
                    if (Math.random() < 0.15) { 
                        let r = Math.random();
                        let type = r < 0.33 ? 'stone' : (r < 0.66 ? 'branch' : 'weed');
                        S.farm.debris[k] = type;
                        taken.add(k);
                    }
                }
            }
        }

        // --- 4. STRUCTURES (Mark them taken too) ---
        const addStruct = (kind, x, y) => {
             addEnt('struct', kind, x, y);
             // We estimate size roughly to block spawning under them
             taken.add(`${x},${y}`); 
             taken.add(`${x+1},${y}`); 
             taken.add(`${x},${y+1}`); 
             taken.add(`${x+1},${y+1}`); 
        };

        // Start at 120. Do NOT start at 110. 110-119 must remain T.BRIDGE (10).
for(let x=120; x<125; x++) for(let y=134; y<=138; y++) S.map[y*MAP_S+x] = T.ROAD;

        addStruct('Telebooth', 124, 130);
        addEnt('struct', 'FarmHouse', 127, 128); // House is big, manual handling not needed as no trees spawn there
        
        // Interior
        addEnt('struct', 'Table', 128, 129); 
        addEnt('struct', 'Bed',   132, 129); 

        addStruct('ShippingBin', 141, 139);
        addStruct('Well', 141, 141);

// --- BOAT SPAWN ---
        // Place in water (x=162), near the sand edge
        addEnt('vehicle', 'boat', 186, 135);


// --- PASTE THIS NEW LINE BELOW IT ---
// Spawns a campfire on the beach (Sand area)
// Spawns a campfire on the beach (Moved: x+3, y-3)
addEnt('obs', 'campfire', 177, 133);




        // --- 5. APPLE TREES (Uneven / Random) ---
        // We try 50 times to place a tree in a random spot.
        let attempts = 0;
        while (attempts < 50) {
            attempts++;

            // 1. Pick a RANDOM spot (not a grid spot)
            // X range: 147 to 158
            // Y range: 122 to 155
            let rX = Math.floor(147 + Math.random() * 11);
            let rY = Math.floor(122 + Math.random() * 33);

            // 2. Skip the Bridge/Road Zone so we don't block the path
            if (rY >= 130 && rY <= 140) continue;

            // 3. Check if this spot is blocked by walls, water, or other trees
            let blocked = false;
            
            // Check the 3x3 square where the tree wants to grow
            for (let ty = rY; ty < rY + 3; ty++) {
                for (let tx = rX; tx < rX + 3; tx++) {
                    // Check if we already put something there (using the 'taken' tracker)
                    if (taken.has(`${tx},${ty}`)) blocked = true;

                    // Double check the map for water/walls
                    let tile = S.map[ty * MAP_S + tx];
                    if (tile === T.WATER || tile === T.BEDROCK) blocked = true;
                }
            }

            // [NEW CODE]
// ...
        // 4. If the spot is free, PLANT THE TREE!
            if (!blocked) {
                // NEW: 50/50 Chance for Apple or Orange
                let tType = Math.random() < 0.5 ? 'tree_apple' : 'tree_orange';
                addEnt('env', tType, rX, rY);
                
                // Mark this ground as 'taken'
                for (let ty = rY; ty < rY + 3; ty++) {
                    for (let tx = rX; tx < rX + 3; tx++) {
                        taken.add(`${tx},${ty}`);
                    }
                }
            }
        }
      
// --- [NEW] OCEAN COVE (Water Only) ---
        // Range: SHIFTED RIGHT BY 15 TILES (208 -> 223)
        // We paint WATER, but we do NOT paint a wall. 
        let cX = 223, cW = 48; 
        
        for (let x = cX; x <= cX + cW; x++) {
            let progress = (x - cX) / cW; 
            // The physical water curve (4 tiles deep)
            let curve = Math.sin(progress * Math.PI) * 4.0; 
            let waterTopY = Math.floor(120 - curve);

            for (let y = waterTopY; y <= 120; y++) {
                S.map[y * MAP_S + x] = T.WATER;
            }
        }








        }
// ...










///////////////////////////////////



    // --- Game Loop ---
    function loop() {
        if(S.run) {
            update();
            draw();
            requestAnimationFrame(loop);
        }
    }


////////////////////////////////



function updateChickens() {
        // Only freeze if we are in the specific Chicken Menu (so it doesn't walk away while picking up)
if (S.ui === 'chicken_opt') return;

        S.ents.forEach(e => {
            if (e.type !== 'chicken') return;
            if (typeof e.walkTimer === 'undefined') e.walkTimer = 0;

            // --- PHASE 1: THINKING ---
            if (e.walkTimer <= 0) {
                // Snap to grid so they don't look offset
                 e.x = Math.round(e.x);
                 e.y = Math.round(e.y);

                if (Math.random() < 0.01) {
                    e.dir = Math.floor(Math.random() * 4);
                    // SPEED IS 0.04.
                    // 25 Frames = 1.0 Distance (1 Tile).
                    // Walk 1, 2, or 3 tiles exactly.
                    let tiles = 1 + Math.floor(Math.random() * 3);
                    e.walkTimer = 25 * tiles; 
                }
            }

            // --- PHASE 2: WALKING ---
            if (e.walkTimer > 0) {
                e.walkTimer--;

                let dx = 0, dy = 0;
                if (e.dir === 0) dy = -1; else if (e.dir === 1) dx = 1;
                else if (e.dir === 2) dy = 1; else if (e.dir === 3) dx = -1;
                
                let spd = 0.04; // Must match the frame calculation above
                let tx = e.x + (dx * spd);
                let ty = e.y + (dy * spd);

                // Check House
                let house = S.ents.find(h => h.kind === 'FarmHouse');
                let insideHouse = (house && tx >= house.x && tx < house.x + house.w && ty >= house.y && ty < house.y + house.h);
                if (insideHouse) { e.walkTimer = 0; return; }

                // Check Collision (Pass 'e' to ignore self)
                let blocked = false;
                if (dx !== 0 && solid(tx + 0.5, e.y + 0.5, e)) blocked = true;
                if (dy !== 0 && solid(e.x + 0.5, ty + 0.5, e)) blocked = true;

                if (!blocked) {
                    e.x = tx;
                    e.y = ty;
                } else {
                    e.walkTimer = 0; // Stop on hit
                }
            }
        });
    }

///////////////////////////////

function updateCows() {
        // FIXED: Only freeze if we are currently in the Cow Menu
        if (S.ui === 'cow_opt') return; 

        S.ents.forEach(e => {
            if (e.type !== 'cow') return;
            if (typeof e.walkTimer === 'undefined') e.walkTimer = 0;

            // THINKING
            if (e.walkTimer <= 0) {
                e.x = Math.round(e.x); e.y = Math.round(e.y); 
                if (Math.random() < 0.015) { 
                    e.dir = Math.floor(Math.random() * 4);
                    let tiles = 1 + Math.floor(Math.random() * 2);
                    e.walkTimer = 50 * tiles; 
                }
            }

            // WALKING
            if (e.walkTimer > 0) {
                e.walkTimer--;
                let dx = 0, dy = 0;
                if (e.dir === 0) dy = -1; else if (e.dir === 1) dx = 1;
                else if (e.dir === 2) dy = 1; else if (e.dir === 3) dx = -1;
                
                let spd = 0.02; 
                let tx = e.x + (dx * spd);
                let ty = e.y + (dy * spd);

                let house = S.ents.find(h => h.kind === 'FarmHouse');
                let insideHouse = (house && tx >= house.x && tx < house.x + house.w && ty >= house.y && ty < house.y + house.h);
                if (insideHouse) { e.walkTimer = 0; return; }

                let blocked = false;
                if (dx !== 0 && solid(tx + 0.5, e.y + 0.5, e)) blocked = true;
                if (dy !== 0 && solid(e.x + 0.5, ty + 0.5, e)) blocked = true;

                if (!blocked) { e.x = tx; e.y = ty; } 
                else { e.walkTimer = 0; }
            }
        });
    }
////////////////////////////////

function updateHorses() {
        if (S.ui === 'horse_opt') return; 

        S.ents.forEach(e => {
            if (e.type !== 'horse') return;
            
            if (typeof e.walkTimer === 'undefined') e.walkTimer = 0;

            // --- PHASE 1: THINKING ---
            if (e.walkTimer <= 0) {
                if (Math.random() < 0.01) { 
                    e.dir = Math.floor(Math.random() * 4);
                    let tiles = 1 + Math.floor(Math.random() * 4);
                    e.walkTimer = tiles * 20; 
                }
            }

            // --- PHASE 2: WALKING ---
            if (e.walkTimer > 0) {
                e.walkTimer--;

                let dx = 0, dy = 0;
                if (e.dir === 0) dy = -1;      
                else if (e.dir === 1) dx = 1;  
                else if (e.dir === 2) dy = 1;  
                else if (e.dir === 3) dx = -1; 
                
                let spd = 0.05; 
                let tx = e.x + (dx * spd);
                let ty = e.y + (dy * spd);

                // --- NEW: HOUSE COLLISION CHECK ---
                // Stop horse from walking into the house footprint
                let house = S.ents.find(h => h.kind === 'FarmHouse');
                if (house) {
                    // Check if target coordinates (tx, ty) are inside the house rect
                    if (tx >= house.x && tx < house.x + house.w && 
                        ty >= house.y && ty < house.y + house.h) {
                        e.walkTimer = 0; // Stop moving
                        return;
                    }
                }
                // ----------------------------------

                let moved = false;
                if (dx !== 0 && !solid(tx + 0.5, e.y + 0.5, e)) { e.x = tx; moved = true; }
                if (dy !== 0 && !solid(e.x + 0.5, ty + 0.5, e)) { e.y = ty; moved = true; }

                if (!moved) e.walkTimer = 0;
            }
        });
    }
//////////////////////////////


function updateTutorial() {
        if (typeof S.farm.tutorialStep === 'undefined') S.farm.tutorialStep = 0;
        let step = S.farm.tutorialStep;

        if (step >= TUTORIAL_STEPS.length) {
            let qTitle = document.getElementById('quest-panel');
            if(qTitle) qTitle.style.display = 'none';
            return;
        }

        let next = false;

        // 1. Interact Dog (Menu Open)
        if (step === 0) { 
            if (S.ui === 'pet_opt') next = true; 
        }
        
        // 2. Clear Debris (Flag)
        else if (step === 1) { 
            if (S.farm.justCleared) { S.farm.justCleared = false; next = true; }
        }
        
        // 3. Till Soil (Flag)
        else if (step === 2) { 
            if (S.farm.justTilled) { S.farm.justTilled = false; next = true; }
        }
        
        // 4. Shop (Flag)
        else if (step === 3) { 
            if (S.farm.justBought) { S.farm.justBought = false; next = true; }
        }
        
        // 5. Bag (Holding seed - State check is fine here)
        else if (step === 4) { 
            if (S.carry && S.carry.type === 'seed') next = true; 
        }
        
        // 6. Plant (Flag)
        else if (step === 5) { 
            if (S.farm.justPlanted) { S.farm.justPlanted = false; next = true; }
        }
        
        // 7. Water (Flag)
        else if (step === 6) { 
            if (S.farm.justWatered) { S.farm.justWatered = false; next = true; }
        }
        
        // 8. Refill (Flag)
        else if (step === 7) { 
            if (S.farm.justRefilled) { S.farm.justRefilled = false; next = true; }
        }
        
        // 9. Sleep (Flag + Magic)
        else if (step === 8) { 
            if (S.farm.justSlept) {
                S.farm.justSlept = false;
                // MAGIC GROW
                for(let k in S.farm.plots) S.farm.plots[k].stage = 3;
                popText(S.p.x, S.p.y, "MAGIC GROW!", "#00e676");
                next = true;
            }
        }
        
        // 10. Harvest (Flag)
        else if (step === 9) { 
            if (S.farm.justHarvested) { S.farm.justHarvested = false; next = true; }
        }
        
        // 11. Sell (Flag + Reward)
        else if (step === 10) { 
            if (S.farm.justSold) {
                S.farm.justSold = false;
                // REWARD
                S.farm.inventory.wood = (S.farm.inventory.wood || 0) + 1;
                popText(S.p.x, S.p.y, "REWARD: +1 TIMBER", "#ffd700");
                next = true;
            }
        }
        
        // 12. Decorate (Flag)
        else if (step === 11) { 
            if (S.farm.justPlaced) { S.farm.justPlaced = false; next = true; }
        }

        if (next) {
            // 1. Advance the Step
            S.farm.tutorialStep++;

            // 2. FLUSH ALL FLAGS (The Fix)
            // We reset every single action flag to false.
            // This ensures that previous actions don't count for future steps.
            S.farm.justCleared = false;
            S.farm.justTilled = false;
            S.farm.justBought = false;
            S.farm.justPlanted = false;
            S.farm.justWatered = false;
            S.farm.justRefilled = false;
            S.farm.justSlept = false;
            S.farm.justHarvested = false;
            S.farm.justSold = false;
            S.farm.justPlaced = false;

            // 3. Visual Feedback
            popText(S.p.x, S.p.y, "STEP COMPLETE!", "#0f0");
            updateFarmUI(); 
        }
    }




    function drawTutorialArrow() {
        let step = S.farm.tutorialStep || 0;
        if (step >= TUTORIAL_STEPS.length) return;

        let targetName = TUTORIAL_STEPS[step].target;
        let tx = 0, ty = 0, found = false;

        // Dynamic Targets
        if (targetName === 'debris') {
            for(let k in S.farm.debris) {
                let p=k.split(','); tx=parseInt(p[0]); ty=parseInt(p[1]); found=true; break;
            }
        } else if (targetName === 'soil') {
            for(let k in S.farm.plots) {
                if(S.farm.plots[k].stage===0) { let p=k.split(','); tx=parseInt(p[0]); ty=parseInt(p[1]); found=true; break; }
            }
        } else if (targetName === 'crop') {
            for(let k in S.farm.plots) {
                if(S.farm.plots[k].stage>=1 && !S.farm.plots[k].watered) { let p=k.split(','); tx=parseInt(p[0]); ty=parseInt(p[1]); found=true; break; }
            }
        } else if (targetName === 'grown_crop') {
            for(let k in S.farm.plots) {
                if(S.farm.plots[k].stage===3) { let p=k.split(','); tx=parseInt(p[0]); ty=parseInt(p[1]); found=true; break; }
            }
        } else if (targetName === 'player' || targetName === 'grass') {
            tx = S.p.x; ty = S.p.y; found = true;
        } else {
            let ent = S.ents.find(e => e.kind === targetName || e.type === targetName);
            if (ent) { tx = ent.x + (ent.w/2); ty = ent.y; found = true; }
        }

        if (found) {
            let sx = Math.floor(tx * TILE - S.cam.x);
            let sy = Math.floor(ty * TILE - S.cam.y);
            let bob = Math.sin(Date.now() / 150) * 5;
            ctx.fillStyle = "#ffd700"; ctx.strokeStyle = "#000"; ctx.lineWidth = 2;
            let ay = sy - 40 + bob;
            ctx.beginPath(); ctx.moveTo(sx, ay+10); ctx.lineTo(sx-10, ay); ctx.lineTo(sx+10, ay);
            ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.font = "bold 14px monospace"; ctx.textAlign = "center"; ctx.fillStyle = "#fff";
            ctx.fillText("HERE", sx, ay - 5); ctx.textAlign = "left";
        }
    }













///////////////////////////////////

   function update() {
        const p = S.p;
        
	updateChickens();
        updateCows(); // <--- IF THIS IS MISSING, COWS ARE STATUES





	updatePets(); // <--- Add this line
	updateHorses(); // <--- ADD THIS LINE HERE





// ---// --- CAMPFIRE UPDATE LOGIC (Final No-Ghost Fix) ---
        S.ents.forEach(e => {
            if (e.kind === 'campfire' && e.lit) {
                
                // 1. Burn Fuel
                e.fuel -= 0.0888; 

                // 2. Make Smoke (White Steam) & Sparks (Yellow)
                // Only make smoke if fuel is > 10 to prevent late ghosts
                if (e.fuel > 10) { 
                    // Changed color to very faint white steam (was dark grey)
                    if (Math.random() < 0.05) part(e.x + 1, e.y + 0.5, 'rgba(255,255,255,0.1)', 1, 4); 
                }
                if (Math.random() < 0.02) part(e.x + 1, e.y + 0.5, '#ffd700', 1, 2);

                // 3. Check if fuel is gone
                if (e.fuel <= 0) {
                    e.lit = false; // Turn off
                    e.fuel = 0;
                    popText(e.x, e.y, "Fire is out", "#ccc");

                    // --- [FIX] THE CLEANUP VACUUM ---
                    // Instantly kill all particles near this fire so they don't linger in the dark
                    S.parts.forEach(p => {
                        // If particle is within 2 tiles of the fire, kill it
                        if (Math.abs(p.x - e.x) < 2 && Math.abs(p.y - e.y) < 2) {
                            p.life = 0; // Die instantly
                        }
                    });
                }
            }
        });

        // --- 1. TIME SYSTEM (4.5 MINUTES) ---
        // 1440 mins / (4.5 * 60 * 60 frames) = 0.0888...
        let prevTime = S.farm.time;
        S.farm.time += 0.0888;


        
        // Day Advance (When time crosses 6:00 AM)
        if (Math.floor(prevTime) < 360 && Math.floor(S.farm.time) >= 360) {
            S.farm.day++;
            S.farm.dayNoticeTimer = 180;

            // --- CRITICAL: DECIDE WEATHER FOR THE NEW DAY ---
            // If we don't do this, the weather never changes, and rain never stops!
            S.farm.weather = (Math.random() < 0.35) ? 'rain' : 'sun';
            
            // If it's raining, water the crops
            if(S.farm.weather === 'rain') {
                for(let k in S.farm.plots) S.farm.plots[k].watered = true;
            }
        }



        // 24-Hour Loop (1440m = 24h)
        if (S.farm.time >= 1440) S.farm.time = 0;

        // BGM Day/Night Cycle (19:00 = 1140)
        if (Math.floor(S.farm.time) === 1140) S.audio.playBGM('farm_night');
        if (Math.floor(S.farm.time) === 360) S.audio.playBGM('farm_day');

        // --- 2. MOVEMENT ----
        let dx=0, dy=0;
        if(S.input.keys['arrowup']) dy=-1; if(S.input.keys['arrowdown']) dy=1;
        if(S.input.keys['arrowleft']) dx=-1; if(S.input.keys['arrowright']) dx=1;
        
       if(dx||dy) {
            // Initialize timer
            if (typeof S.farm.stepTimer === 'undefined') S.farm.stepTimer = 0;
            S.farm.stepTimer--; 

            if (S.farm.stepTimer <= 0) {








               // === CASE 0: ROWING BOAT ===
                if (S.p.isBoating) {
                    // --- CHANGED: 45 -> 85 ---
                    // The visual animation takes about 1.4 seconds.
                    // 85 frames * (1/60) ≈ 1.41 seconds.
                    // Now the sound will match the oar hitting the water!
                    S.farm.stepTimer = 85; 
                    
                    S.audio.play('row_boat'); 
                    part(p.x, p.y + 0.8, '#b3e5fc', 2, 3);
                }
                // === CASE 1: RIDING HORSE ===
                else if (S.p.isRiding) {
                    S.farm.stepTimer = 18; 
                    S.audio.play('horse_walk'); 
                    if(Math.random() < 0.5) part(S.p.x, S.p.y + 0.8, '#d7ccc8', 1, 2);
                } 
                // === CASE 2: WALKING ===
                else {
                    S.farm.stepTimer = 22; 
                    S.audio.play('step'); 
                }
            }

            let len = Math.hypot(dx,dy);

            dx=(dx/len)*p.spd; dy=(dy/len)*p.spd;
            
            // --- NEW: HEAVY PUSH MECHANIC ---
            // 1. Look ahead (smaller reach = need to touch body)
           // Reach further (0.75) to grab the cow before we hit its collision box
let frontX = p.x + 0.5 + (dx / p.spd * 0.75); 
let frontY = p.y + 0.5 + (dy / p.spd * 0.75);
            
            // 2. Find Cow
            let cow = S.ents.find(e => e.type === 'cow' && xIn(e, frontX, frontY));
            
            if (cow) {
                // 3. Apply "Weight"
                // The cow only moves at 30% speed (Heavy)
                let pushFactor = 0.3; 
                let cTx = cow.x + (dx * pushFactor); 
                let cTy = cow.y + (dy * pushFactor);
                
                // 4. Move Cow (Ignore self in collision)
                if (!solid(cTx + 0.5, cow.y + 0.5, cow)) cow.x = cTx;
                if (!solid(cow.x + 0.5, cTy + 0.5, cow)) cow.y = cTy;

                // 5. Slow Player Down (Feedback)
                dx *= 0.5; 
                dy *= 0.5;
            }
            // -----------------------------

            let tx = p.x + dx; let ty = p.y + dy;
            





// [PASTE THIS HERE]
            // --- SMOOTH SLIDE INTERCEPTOR ---
            // If we are walking into the Cove wall, don't stop.
            // Instead, clamp 'ty' exactly to the curve line so we slide along it.
           // --- SMOOTH SLIDE INTERCEPTOR (The Mix: Close + Smooth) ---
            // Range: 221.5 to 273.5
            if (tx >= 221.5 && tx <= 273.5) {
                
                const getSlideY = (worldX) => {
                    let clampedX = Math.max(222, Math.min(273, worldX));
                    let relX = clampedX - 222;
                    const p1x=12, p2x=39, p3x=51;
                    
                    let t = relX / 51.0; 
                    for(let i=0; i<5; i++) { // Increased precision to 5 to match canMove
                        let inv = 1-t;
                        let bx = (3*inv*inv*t * p1x) + (3*inv*t*t * p2x) + (t*t*t * p3x);
                        let slope = (3*inv*inv * p1x) + (6*inv*t * (p2x-p1x)) + (3*t*t * (p3x-p2x));
                        if (Math.abs(slope) > 0.001) t -= (bx - relX) / slope;
                    }
                    let inv = 1-t;
                    let by = (3*inv*inv*t * 7.0) + (3*inv*t*t * 7.0);
                    return 120 - by; 
                };

                let ceilingY = getSlideY(tx);

                // --- THE MIX FIX (-0.4) ---
                // -0.5 was too aggressive (caused jitter).
                // 0.0 was too far (original).
                // -0.4 gets you close but keeps a tiny "smoothness buffer".
                let limitY = ceilingY - 0.4;

                if (ty < limitY) {
                    ty = limitY;
                }
            }










            // --- MOVEMENT LOGIC (WALK vs BOAT) ---
            // --- MOVEMENT LOGIC (WALK vs BOAT) ---
            // --- MOVEMENT LOGIC (WALK vs BOAT) ---
           // --- MOVEMENT LOGIC (WALK vs BOAT) ---
           // --- MOVEMENT LOGIC (WALK vs BOAT) ---
          // --- MOVEMENT LOGIC (WALK vs BOAT) ---
            // --- MOVEMENT LOGIC (WALK vs BOAT) ---
           // --- MOVEMENT LOGIC (WALK vs BOAT) ---
            // --- MOVEMENT LOGIC (WALK vs BOAT) ---
          const canMove = (nx, ny) => {
                
                // --- 1. SPECIAL: COVE VECTOR COLLISION ---
                // Range: 221.5 to 273.5 (Widened to catch player before Grid hits)
                if (nx >= 221.5 && nx <= 273.5 && ny >= 105 && ny <= 125) {
                    
                    // A. SOLVE BEZIER MATH (The "Invisible Wall" Line)
                    const getExactCurveY = (worldX) => {
                        let clampedX = Math.max(222, Math.min(273, worldX));
                        let relX = clampedX - 222;
                        
                        const p0x=0, p1x=12, p2x=39, p3x=51;
                        
                        // Solve t for X (High Precision 8 Iterations)
                        let t = relX / 51.0; 
                        for(let i=0; i<8; i++) { 
                            let inv = 1-t;
                            let bx = (3*inv*inv*t * p1x) + (3*inv*t*t * p2x) + (t*t*t * p3x);
                            let slope = (3*inv*inv * p1x) + (6*inv*t * (p2x-p1x)) + (3*t*t * (p3x-p2x));
                            if (Math.abs(slope) > 0.0001) t -= (bx - relX) / slope;
                        }

                        let inv = 1-t;
                        let by = (3*inv*inv*t * 7.0) + (3*inv*t*t * 7.0);
                        return 120 - by;
                    };



                    // --- UPDATE THIS LINE ---
                    // Must match the Slide Interceptor offset (-0.4)
                    let limitY = getExactCurveY(nx) - 0.4;




                    // B. UPPER BOUND CHECK
                    // If your feet (ny) are higher (smaller number) than the curve line -> BLOCK
                    if (ny < limitY) {
                        return false; 
                    }

                    // C. GROUND CHECK (Bypass Bedrock)
                    // If we are below the curve, we ignore the Map Grid (Bedrock)
                    // and only check for fences/cows/trees.
                    let ix = Math.floor(nx);
                    let iy = Math.floor(ny);
                    let k = `${ix},${iy}`;

                    if (S.farm.fences[k] || S.farm.debris[k] || S.farm.structures[k]) return false;

                    for (let e of S.ents) {
                        if (nx >= e.x && nx < e.x + e.w && ny >= e.y && ny < e.y + e.h) {
                            return false;
                        }
                    }

                    // FORCE ALLOW (We are in the safe zone of the Cove)
                    return true; 
                }

                // --- 2. BOAT MODE (Fixed: River vs Beach) ---
                if (S.p.isBoating) {
                    
                    // [NEW] HARD SAFETY STOP: VOID LIMIT
                    if (ny >= 159) return false; 

                    let mx = Math.floor(nx);
                    let my = Math.floor(ny);
                    if (mx < 0 || mx >= MAP_S || my < 0 || my >= MAP_S) return false;
                    let tile = S.map[my * MAP_S + mx];




// =========================================================
                    // [FIX] BLOCK SPECIFIC ROCK PATCHES
                    // =========================================================
                    if (PATCH_TILES.has(`${mx},${my}`)) return false;



                    // =========================================================
                    // [FIX] COVE SHOULDER BLOCKS (PREVENTS LEAKING)
                    // =========================================================
                    // We explicitly block the "Gateposts" of the cove entrance.
                    // This stops the boat from sailing through the transition tiles.
                    
                    // 1. Left Pillar (x=222) - Block anything at or above water line
                    if (mx === 222 && my <= 121) return false; 

                    // 2. Right Pillar (x=273) - Block anything at or above water line
                    if (mx === 273 && my <= 121) return false;

                    // 3. Existing Drip Rocks (Left Side Waterfall effect)
                    if (
                        (mx === 221 && my === 121) ||
                        (mx === 220 && my === 122) ||
                        (mx === 219 && my === 123) ||
                        (mx === 218 && my === 124)
                    ) return false;

                    // 4. Existing Drip Rocks (Right Side Waterfall effect)
                    if (
                        (mx === 274 && (my >= 122 && my <= 125)) ||
                        (mx === 275 && my === 125)
                    ) return false;
                    // =========================================================


                    // A. CHECK TILE VALIDITY
                    let isValidWater = false;

                    // 1. Standard Water & Sand
                    if (tile === 0) isValidWater = true; 
                    if (tile === 3) isValidWater = true;

                    // 2. Cove "Hole" (Bedrock 12)
                    // Added "&& ny < 130" to ensure we don't accidentally allow the bottom void
                    // [CRITICAL FIX]: changed range to 222.1 to 272.9 to avoid catching the walls
                    if (tile === 12 && nx > 222.1 && nx < 272.9) {
                         const getCoveCeiling = (worldX) => {
                            let relX = worldX - 222;
                            const p1x=12, p2x=39, p3x=51;
                            let t = relX / 51.0; 
                            for(let i=0; i<4; i++) { 
                                let inv = 1-t;
                                let bx = (3*inv*inv*t * p1x) + (3*inv*t*t * p2x) + (t*t*t * p3x);
                                let slope = (3*inv*inv * p1x) + (6*inv*t * (p2x-p1x)) + (3*t*t * (p3x-p2x));
                                if (Math.abs(slope) > 0.001) t -= (bx - relX) / slope;
                            }
                            let inv = 1-t;
                            let by = (3*inv*inv*t * 7.0) + (3*inv*t*t * 7.0);
                            return 120 - by; 
                         };
                         
                         // Check collision against the curve AND ensure we are high up
                         if (ny > (getCoveCeiling(nx) - 0.4) && ny < 130) isValidWater = true;
                    }

                    if (!isValidWater) return false; // Blocked by Land/Road/Solid Bedrock

                    // ... (The rest of the function remains the same) ...

                    // ... (Keep the rest of your Beach Shoreline logic here) ...
                    
                    // B. CHECK SHORELINE (Beach Curve)
                    if (nx >= 160 && nx < 200) {
                        let regionTop = 120, regionHeight = 40;
                        let normY = (ny - regionTop) / regionHeight;
                        if (normY < 0) normY = 0; if (normY > 1) normY = 1;
                        let curve = Math.sin(normY * Math.PI) * 6.0;
                        let waterX = 190.0 - curve; 
                        if (nx < waterX) return false;
                    }

                    // C. CHECK OBJECTS
                    for (let e of S.ents) {
                        if (e.type === 'obs' || e.type === 'struct') {
                            if (nx >= e.x && nx < e.x + e.w && ny >= e.y && ny < e.y + e.h) return false;
                        }
                    }
                    
                    let k = `${mx},${my}`;
                    if (S.farm.fences[k] || S.farm.debris[k] || S.farm.structures[k]) return false;
                    
                    return true;
                }
                



                // --- 3. WALK MODE (Extended Shallow Water +2) ---
                else {
                    // Step A: Check if the tile is normally solid (Walls, Fences, Water)
                    if (solid(nx, ny)) {
                        
                        // Step B: detailed check - Is it blocked by Water specifically?
                        let mx = Math.floor(nx);
                        let my = Math.floor(ny);
                        let t = S.map[my * MAP_S + mx];

                        // If it is WATER (0), check if we are in the "Shallow Zone"
                        if (t === 0) {
                            
                            // [FIX] VOID PROTECTION: 
                            // Only allow wading if we are actually at the Beach (Right side).
                            // This prevents walking on the "Water/Void" tiles near the Bridge (x=109-120)
                            // and prevents walking into the deep River (x=140-150).
                            if (nx < 160) return false; 

                            // 1. Calculate the exact Shore Line (The Formula)
                            let normY = (ny - 120) / 40;
                            if (normY < 0) normY = 0; if (normY > 1) normY = 1;
                            let curve = Math.sin(normY * Math.PI) * 6.0;
                            let shoreX = 190.0 - curve; 

                            // 2. Allow walking up to Formula Line + 2 tiles (Shallow Wade)
                            // We use 2.8 to ensure the player can fully occupy the 2nd water tile.
                            if (nx < shoreX + 2.8) {
                                
                                // 3. Safety Check: No walking through objects in water
                                let k = `${mx},${my}`;
                                if (S.farm.fences[k] || S.farm.debris[k] || S.farm.structures[k]) return false;
                                
                                for (let e of S.ents) {
                                    // --- FIX: Allow walking out of boat ---
                                    if (e.kind === 'boat') {
                                        // If we are currently standing inside the boat, ignore it so we can walk out
                                        let px = S.p.x + 0.5, py = S.p.y + 0.5;
                                        if (px >= e.x && px < e.x + e.w && py >= e.y && py < e.y + e.h) continue;
                                    }
                                    
                                    if (nx >= e.x && nx < e.x + e.w && ny >= e.y && ny < e.y + e.h) return false;
                                }
                                
                                // All clear! We are knee-deep in water.
                                return true; 
                            }
                        }
                        return false; // Blocked by Bedrock, Object, or Deep Water
                    }
                    return true; // Not solid (Grass/Sand)
                }
            };











            if(canMove(tx+0.5, p.y+0.5)) p.x = tx;
            if(canMove(p.x+0.5, ty+0.5)) p.y = ty;
            
            if(dy<0) p.dir=0; if(dx>0) p.dir=1; if(dy>0) p.dir=2; if(dx<0) p.dir=3;


        }


// [THE MEAT] --- PASTE THIS BLOCK HERE ---
        // --- FIX: AUTO-DROP ITEMS & HORSE AT EXIT ---
        // Trigger line: x < 120 (The start of the bridge)
        if (p.x < 120) {
            
            // 1. HORSE DISMOUNT (New!)
            if (S.p.isRiding) {
                S.p.isRiding = false;
                
                // Restore Class Speed
                if (S.p.class === 'rogue') S.p.spd = 0.15;
                else if (S.p.class === 'warrior') S.p.spd = 0.12;
                else S.p.spd = 0.13;

                // Teleport Horse back to the yard (Safe Spot)
                addEnt('horse', 'horse', 132, 135);
                
                popText(p.x, p.y, "Horse Stayed", "#fff");
                updateFarmUI();
            }

            // 2. CARRY DROP (Items & Small Animals)
            if (S.carry) {
                // Refund Items (Wood, Seeds)
                if (S.carry.type === 'place' || S.carry.type === 'seed') {
                    S.farm.inventory[S.carry.id] = (S.farm.inventory[S.carry.id] || 0) + 1;
                    popText(p.x, p.y, "Returned", "#fff");
                }
                
                // Return Chickens
                else if (S.carry.type === 'chicken_place') {
                    addEnt('chicken', 'chicken', 130, 135);
                    popText(p.x, p.y, "Sent Home", "#fff");
                }
                // Return Pets
                else if (S.carry.type === 'pet_place') {
                    addEnt('pet', S.carry.id, 130, 135); 
                    popText(p.x, p.y, "Sent Home", "#fff");
                }

                S.carry = null; // Clear hands
            }
        }
// ----------------------------------------



        // --- 3. CAMERA ---
        if(S.shake > 0) S.shake *= 0.8;
        S.cam.x += (p.x*TILE - cvs.width/2 - S.cam.x) * 0.1;
        S.cam.y += (p.y*TILE - cvs.height/2 - S.cam.y) * 0.1;



// --- 4. DOLPHIN SPAWNER (Smart Walls + Specific Region) ---
   // --- 4. DOLPHIN SPAWNER (Right Wall Buffer -12) ---
        // Range: 160 to 295
        if (S.p.isBoating && S.p.x >= 160 && S.p.x < 295) {
            
            // Hard limit for bottom void safety
            if (S.p.y > 154) return; 

           // --- CHANGED: NORMAL FREQUENCY ---
            // 0.03  = Testing (2 per second)
            // 0.001 = Normal  (1 every ~15 seconds)
            if (Math.random() < 0.001) {

                // --- HELPER: Calculate Walls at any Y ---
                const getWallsAt = (y) => {
                    // Left Wall (Beach)
                    let normY = (y - 120) / 40;
                    if (normY < 0) normY = 0; if (normY > 1) normY = 1;
                    let bX = 190.0 - (Math.sin(normY * Math.PI) * 6.0);

                    // Left Wall (Group 1 - Top)
                    // Extended range to 132 for safety
                    let g1X = -999;
                    if (y >= 120 && y <= 132) g1X = 221.0 - ((y - 120) * 1.375);

                    // Left Wall (Group 3 - Bottom)
                    let g3X = -999;
                    if (y >= 150 && y <= 158) g3X = 180.0 + ((y - 150) * 3.75);

                    let L = Math.max(bX, g1X, g3X);

                    // Right Wall (Group 2)
                    let normY_R = (y - 120) / 39;
                    if (normY_R < 0) normY_R = 0; if (normY_R > 1) normY_R = 1;
                    let R = 273.0 + (Math.sin(normY_R * Math.PI) * 11.0);

                    return { L, R };
                };

                // --- 1. DIRECTION LOGIC ---
                let wallsP = getWallsAt(S.p.y);
                let dir = Math.random() < 0.5 ? 1 : -1;

                if (S.p.x < wallsP.L + 12) dir = 1; 
                else if (S.p.x > wallsP.R - 12) dir = -1;
                
                // Force Right at Cove Entrance
                if (S.p.x >= 220 && S.p.x <= 232 && S.p.y >= 115 && S.p.y <= 121) dir = 1; 


                // --- 2. SPAWN CALCULATION ---
                let dist = 2.0 + Math.random() * 3.0; 
                let destX = S.p.x + (dist * dir);
                let spawnY = S.p.y + (Math.random() * 4 - 2);


                // --- 3. VALIDATION (With -12 Buffer on Right) ---
                // 3-Point Check for Diagonals
                let wTop = getWallsAt(spawnY - 2.0);
                let wCenter = getWallsAt(spawnY);
                let wBottom = getWallsAt(spawnY + 2.0);

                let limitL = Math.max(wTop.L, wCenter.L, wBottom.L);
                let limitR = Math.min(wTop.R, wCenter.R, wBottom.R);

                // [FIX] Added "- 12" to the Right Limit
                // This ensures we never spawn in the 12 tiles closest to the right rocks.
                let validX = (destX > limitL && destX < limitR - 12);
                
                let validY = (spawnY < 155); 

                if (validX && validY) {
                    
                    // === PHYSICS ENGINE ===
                    let jumpForce = -0.40; 
                    let jumpGrav  = 0.020; 
                    let jumpSpeed = 0.15;  

                    // === COVE EXCEPTION ===
                    if (destX >= 222 && destX <= 273) {
                        
                        let isDangerZone = (destX >= 228 && destX <= 242) || (destX >= 252 && destX <= 266);

                        if (isDangerZone) {
                            if (spawnY < 120) spawnY = 120 + Math.random() * 1.5;
                            jumpForce = -0.14; 
                            jumpGrav  = 0.045; 
                            jumpSpeed = 0.28;  
                        } 
                        else {
                            jumpForce = -0.22; 
                            jumpGrav  = 0.025; 
                            jumpSpeed = 0.20; 
                            if (spawnY < 117) spawnY = 117; 
                        }
                    }

                    S.parts.push({
                        type: 'dolphin',
                        x: destX, 
                        y: spawnY,
                        startY: spawnY, 
                        vx: dir * jumpSpeed, 
                        vy: jumpForce,      
                        grav: jumpGrav,    
                        life: 200,      
                        dir: dir
                    });

                    part(destX, spawnY, '#b3e5fc', 12, 5);
                }
            }
        }




// --- MASTER AMBIENCE LOOP ---
        // Placed here so it checks AFTER fuel runs out and AFTER day changes
        if (S.audio.updateAmbience) {
            let isRain = (S.farm.weather === 'rain');
            let isOcean = (S.p.x > 160);




           // [FIX] DISTANCE CHECK: Only hear fire if within 15 tiles
            let isFire = S.ents.some(e => 
                e.kind === 'campfire' && 
                e.lit && 
                Math.hypot(e.x - S.p.x, e.y - S.p.y) < 15
            );

            S.audio.updateAmbience(isRain, isOcean, isFire);
        }






updateTutorial();
    }

    // --- Interaction ---
/////////////
// --- NEW: Handle Context Menus ---
  // --- REPLACE THE ENTIRE handleMenuAction FUNCTION WITH THIS ---
  // --- REPLACE handleMenuAction FUNCTION ---
   function handleMenuAction() {
        S.audio.play('btn_click'); 

        // --- BOAT MENU ---
        if (S.ui === 'boat_opt') {
            let boat = S.menuTarget;
            if (S.menuSel === 0) { // SAIL
                // 1. Remove Boat Entity
                S.ents = S.ents.filter(e => e !== boat);
                // 2. Set State
                S.p.isBoating = true;
                S.p.isRiding = false; 
                S.p.x = boat.x; S.p.y = boat.y;
                // --- CHANGED: SLOWER SPEED ---
                S.p.spd = 0.08; // Was 0.15. Now 0.08 (Heavy Rowing)
                // -----------------------------
                popText(S.p.x, S.p.y, "Set Sail!", "#4fc3f7");
                updateFarmUI();
            }
            S.ui = 'none';
            return;
        }
        
        // ... rest of menu logic ...







// --- PASTE THIS NEW BLOCK HERE ---
// --- CAMPFIRE MENU ---
// --- CAMPFIRE MENU ---
        // --- CAMPFIRE MENU ACTION ---
        if (S.ui === 'fire_opt') {
            let fire = S.menuTarget;
            if (S.menuSel === 0) { 
                fire.lit = true;
                fire.fuel = 180; // <--- CHANGED: 180 mins = 3 Game Hours
                S.audio.play('btn_click'); 
                popText(S.p.x, S.p.y, "Warmth...", "#ffa726");
                // Start particle burst
                for(let i=0; i<10; i++) part(fire.x+1, fire.y+1, '#ffd700', 1, 3);
            }
            S.ui = 'none';
            return;
        }









// HORSE MENU




// HORSE MENU
        // HORSE MENU
        if (S.ui === 'horse_opt') {
            let horse = S.menuTarget;
            
            if (S.menuSel === 0) { // PET
                S.audio.play('pet_anim'); // <--- CHANGED
                // Spawn Heart High Up (y - 2.0)
                popText(S.p.x, S.p.y - 2.0, "❤️", "#e91e63");
                // Spawn Text Lower (y - 0.5)
                popText(horse.x, horse.y - 0.5, "Neigh!", "#fff", true);
            }
            else if (S.menuSel === 1) { // RIDE
                // 1. Remove Horse Entity
                S.ents = S.ents.filter(e => e !== horse);
                
                // 2. Mount
                S.p.isRiding = true;
                S.p.spd = 0.30;
                S.p.x = horse.x; 
                S.p.y = horse.y;
                
                popText(S.p.x, S.p.y, "Giddy Up!", "#ffd700");
                updateFarmUI();
            }
            // (Selection 2 is Cancel, handled automatically below)
            S.ui = 'none';
            return;
        }







// PET MENU
        // PET MENU
        if (S.ui === 'pet_opt') {
            let pet = S.menuTarget;
            
            if (S.menuSel === 0) { // PET
                S.audio.play('pet_anim'); // <--- CHANGED
                // Spawn Heart High Up (y - 2.0)
                popText(S.p.x, S.p.y - 2.0, "❤️", "#e91e63");
                
                // Spawn Text Lower (y - 0.5)
                if(pet.kind === 'dog') popText(pet.x, pet.y - 0.5, "WOOF!", "#fff", true);
                else popText(pet.x, pet.y - 0.5, "MEOW...", "#fff", true);
            }
            else if (S.menuSel === 1) { // MOVE
                S.ents = S.ents.filter(e => e !== pet);
                S.carry = { id: pet.kind, type: 'pet_place', icon: (pet.kind==='dog'?'🐶':'🐱') };
                popText(S.p.x, S.p.y, "Carrying", "#fff");
            }
            else if (S.menuSel === 2) { // TOGGLE: FOLLOW / ROAM
                pet.following = !pet.following;
                
                if (pet.following) {
                    popText(S.p.x, S.p.y, "Following!", "#4caf50");
                } else {
                    popText(S.p.x, S.p.y, "Roaming...", "#81c784");
                }
            }
            
            // Index 3 is Cancel, which just closes the menu automatically below
            S.ui = 'none';
            return;
        }






// 1. COW MENU
        // 1. COW MENU
        if (S.ui === 'cow_opt') {
            let cow = S.menuTarget;
            
            if (S.menuSel === 0) { // PET
                S.audio.play('pet_anim'); // <--- CHANGED
                // Spawn Heart High Up
                popText(S.p.x, S.p.y - 1.5, "❤️", "#e91e63");
            }
            else if (S.menuSel === 1) { // GET MILK
                if (!cow.milked) {
                    cow.milked = true;
                    S.farm.inventory.milk++; 
                    S.audio.play('item_found'); // AUDIO
                    popText(S.p.x, S.p.y, "🥛", "#fff"); // Success Icon
                } else {
                    // CLEAR TEXT REMINDER
                    popText(S.p.x, S.p.y, "Once a day", "#ef5350", true); 
                }
            }
            S.ui = 'none';
            return;
        }





// 0. CHICKEN MENU
        if (S.ui === 'chicken_opt') {
            if (S.menuSel === 1) { // Selected "Move" (Index 1)
                // Remove the chicken from the world
                S.ents = S.ents.filter(e => e !== S.menuTarget);
                
                // Put it in our hands
                S.carry = { id: 'chicken', type: 'chicken_place', icon: '🐔' };
                
                popText(S.p.x, S.p.y, "Got Chicken!", "#fff");
            }
            // Close menu (for both Cancel and Move)
            S.ui = 'none';
            return; 
        }


if (S.ui === 'cow_opt') {
                opts = ["Pet", "Get Milk", "Cancel"];
            }






        // A. SLEEP MENU
        if (S.ui === 'sleep_opt') {
            if (S.menuSel === 0) { // SLEEP SELECTED
                Region9Farm.sleep(); 
                S.ui = 'none';
            } else { // CANCEL
                S.ui = 'none';
            }
        }
        // B. BAG MENU (Fix for New Seeds)
        // B. BAG MENU (Fix for New Seeds)
        else if (S.ui === 'bag_opt') {
            if (S.menuSel === 0) { // PLANT/HOLD
                let item = getBagItemAt(S.bag.tab, S.bag.cx, S.bag.cy);
                if (S.farm.inventory[item.id] > 0) {
                    S.farm.inventory[item.id]--; 
                    
                    // CHECK: Is it 'carrot_seeds' OR does it end with '_seeds'?
                    let isSeed = (item.id === 'carrot_seeds' || item.id.endsWith('_seeds'));

                    if (isSeed) {
                        // Set type to 'seed' so planting logic works
                        S.carry = { id: item.id, type: 'seed', icon: '🥡' };
                        popText(S.p.x, S.p.y, "SEED MODE", "#aed581");
                    } else {
                        // Otherwise it's furniture/item
                        S.carry = { id: item.id, type: 'place', icon: item.icon };
                        popText(S.p.x, S.p.y, "CARRYING", "#ffd700");
                    }
                    S.ui = 'bag'; toggleBag(); 
                } else {
                    // NEW: Error feedback for empty items
                    S.audio.play('error');
                    popText(S.p.x, S.p.y, "Empty!", "#ef5350");
                    S.ui = 'bag'; // Return to Bag Grid
                }
            } else { S.ui = 'bag'; }
        }


        // C. GROUND ITEM MENU
        else if (S.ui === 'item_opt') {
            let k = `${S.menuTarget.x},${S.menuTarget.y}`;
            let id = S.farm.structures[k];
            
            // Check if it is a letter brick (it has 4 options)
            let isLetter = (id === 'letter_brick');

            if (isLetter) {
                // Options: [Change, Move, Put Back, Cancel]
                if (S.menuSel === 0) { // CHANGE LETTER
                     S.ui = 'letter_edit'; 
                     updateFarmUI(); // <--- ADD THIS to hide UI immediately
                     return;
                }
                if (S.menuSel === 3) { S.ui = 'none'; return; } // CANCEL
                
                // For Move/Put Back, shift index down by 1 to match logic below
                if (S.menuSel === 1) S.menuSel = 1; // Move
                if (S.menuSel === 2) S.menuSel = 2; // Put Back
            } else {
                // Options: [Cancel, Move, Put Back]
                if (S.menuSel === 0) { S.ui = 'none'; return; }
            }

            // SHARED LOGIC (Move/Put Back)
            if (S.menuSel === 1) { // MOVE
                if (id) {
                    delete S.farm.structures[k];
                    if(S.farm.letterData[k]) delete S.farm.letterData[k]; // Cleanup Data
                    
                    // --- STEP 4 UPDATE IS HERE ---




                    // Determine Icon
                    let ic = '📦';
                    if(id==='wood') ic='🪵'; else if(id==='brick') ic='🧱'; else if(id==='letter_brick') ic='🔠';
                    else if(id==='stake') ic='🥢'; else if(id==='star') ic='⭐'; else if(id.startsWith('bal')) ic='🎈';
                    else if(id==='teddy') ic='🧸'; else if(id==='qbox') ic='❓'; else if(id==='coin') ic='🪙';
                    else if(id==='egg') ic='🥚';
                    // FLOWERS
                    else if(id==='rose') ic='🌹'; else if(id==='sunflower') ic='🌻';
                    else if(id==='tulip') ic='🌷'; else if(id==='lavender') ic='🪻';
                    // PRODUCE
                    else if(id==='carrot') ic='🥕'; else if(id==='potato') ic='🥔';
                    else if(id==='corn') ic='🌽'; else if(id==='tomato') ic='🍅';
                    
                    S.carry = { id: id, type: 'place', icon: ic };







                    // -----------------------------

                    S.ui = 'none'; popText(S.p.x, S.p.y, "MOVE", "#fff");
                }
            }
            else if (S.menuSel === 2) { // PUT BACK
                if (id) {
                    delete S.farm.structures[k];
                    if(S.farm.letterData[k]) delete S.farm.letterData[k]; // Cleanup Data
                    S.farm.inventory[id]++;
                    S.ui = 'none'; popText(S.p.x, S.p.y, "+1 BAG", "#ffd700");
                }
            }
        }
    }



///////////////////////////
// --- REPLACE interact FUNCTION ---
  function interact() {
        const p = S.p;
        let tx = Math.round(p.x + (p.dir===1?1:p.dir===3?-1:0));
        let ty = Math.round(p.y + (p.dir===2?1:p.dir===0?-1:0));
        let k = `${tx},${ty}`;

        // --- BOAT INTERACTION ---

        // A. DISMOUNT (Smart Spawn - Prevents Wall Traps)
        if (S.p.isBoating) {
            // 1. Calculate Shore X (Beach Limit)
            let regionTop = 120, regionHeight = 40;
            let normY = (p.y - regionTop) / regionHeight;
            if (normY < 0) normY = 0; if (normY > 1) normY = 1;
            let shoreX = 190.0 - (Math.sin(normY * Math.PI) * 6.0);
            
            // 2. Calculate Cove Y (Cove Wall Limit)
            let coveLimitY = -999; // Default (No wall)
            if (p.x >= 221 && p.x <= 274) {
                const getCoveY = (wx) => {
                    let relX = wx - 222;
                    const p1x=12, p2x=39, p3x=51;
                    let t = relX / 51.0; 
                    for(let i=0; i<4; i++) { 
                        let inv = 1-t;
                        let bx = (3*inv*inv*t * p1x) + (3*inv*t*t * p2x) + (t*t*t * p3x);
                        let slope = (3*inv*inv * p1x) + (6*inv*t * (p2x-p1x)) + (3*t*t * (p3x-p2x));
                        if (Math.abs(slope) > 0.001) t -= (bx - relX) / slope;
                    }
                    let inv = 1-t;
                    let by = (3*inv*inv*t * 7.0) + (3*inv*t*t * 7.0);
                    return 120 - by;
                };
                coveLimitY = getCoveY(p.x);
            }

            // 3. Determine Safe Spawn Spot
            let spawnX = Math.round(p.x);
            let spawnY = Math.round(p.y);

            // A. Fix Beach Trap: If too far left, push right
            if (spawnX < shoreX) spawnX = Math.ceil(shoreX);




// B. Fix Cove Trap: If too high (in wall), push down (water)
            // We use floor+1 or ceil to ensure we are clearly OUT of the wall
            if (spawnY < coveLimitY) spawnY = Math.ceil(coveLimitY);

           // 4. Execute
            // --- FIX: JUMP TO SHORE (GRID SNAPPED) ---
            if (p.x < shoreX + 1.2) { 
                S.p.isBoating = false;

// --- RESTORE CLASS SPEED ---
                if (S.p.class === 'rogue') S.p.spd = 0.15;
                else if (S.p.class === 'warrior') S.p.spd = 0.12;
                else S.p.spd = 0.13; // Mage
                
                // 1. Snap coordinates to whole numbers (Fixes infinite spawn bug)
                let bx = Math.round(shoreX);
                let by = Math.round(spawnY);

                // 2. Teleport Player to Land (Left of boat)
                S.p.x = bx - 1; 
                S.p.y = by;
                
                // 3. Safety Check: Only spawn if a boat isn't already there
                let stackCheck = S.ents.find(e => e.kind === 'boat' && Math.abs(e.x - bx) < 1 && Math.abs(e.y - by) < 1);
                
                if (!stackCheck) {
                    addEnt('vehicle', 'boat', bx, by);
                }

                popText(p.x, p.y, "Splash!", "#4fc3f7");
                S.audio.play('water'); 
            } else {
                popText(p.x, p.y, "Too Deep!", "#ef5350");
            }
            return; 
        }





        // B. BOARDING (Open Menu)
        let boat = S.ents.find(e => e.kind === 'boat' && xIn(e, tx, ty));
        if (boat) {
            S.audio.play('btn_click');
            S.menuTarget = boat;
            S.ui = 'boat_opt';
            S.menuSel = 0;
            return;
        }

        // ... Rest of interact function ...








///////////////

// --- 0. HORSE LOGIC (Insert at top of interact) ---
        
        // A. DISMOUNT (Smart Placement)
        if (S.p.isRiding) {
            // We need to find a free spot to put the horse so we don't get stuck inside it.
            // Priority: Try placing it BEHIND the player first.
            let behindX = (p.dir===1?-1:p.dir===3?1:0);
            let behindY = (p.dir===2?-1:p.dir===0?1:0);
            
            // List of spots to try: [Behind, Left, Right, Up, Down]
            let candidates = [
                {x: behindX, y: behindY}, 
                {x: -1, y: 0}, {x: 1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}
            ];

            let spawnX = null, spawnY = null;

            // Loop through spots to find one that isn't a wall/water
            for (let c of candidates) {
                let tx = Math.round(p.x + c.x);
                let ty = Math.round(p.y + c.y);
                
                // Check collision at the center of that tile
                if (!solid(tx + 0.5, ty + 0.5)) {
                    spawnX = tx;
                    spawnY = ty;
                    break; // Found a spot! Stop looking.
                }
            }

            if (spawnX !== null) {
                // Success: Hop off and place horse at the safe spot
                S.p.isRiding = false;
                // --- RESTORE CLASS SPEED ---
                if (S.p.class === 'rogue') S.p.spd = 0.15;
                else if (S.p.class === 'warrior') S.p.spd = 0.12;
                else S.p.spd = 0.13;
                addEnt('horse', 'horse', spawnX, spawnY);
                popText(p.x, p.y, "Hop!", "#fff");
                updateFarmUI();
            } else {
                // Failure: Surrounded by obstacles
                popText(p.x, p.y, "No space!", "#ef5350");
            }
            return; // Stop here
        }

       // B. HORSE MENU (Open Chat Box)
        let horse = S.ents.find(e => e.kind === 'horse' && xIn(e, tx, ty));
        if (horse) {
            S.audio.play('btn_click'); // AUDIO: Open Menu
            S.menuTarget = horse;
            S.ui = 'horse_opt';
            S.menuSel = 0;
            return; // Stop here
        }




// --- PASTE THIS NEW BLOCK HERE ---
// C. CAMPFIRE INTERACTION
let fire = S.ents.find(e => e.kind === 'campfire' && xIn(e, tx, ty));
if (fire) {
    S.audio.play('btn_click');
    S.menuTarget = fire;
    S.ui = 'fire_opt'; // Set UI state to Fire Menu
    S.menuSel = 0;
    return;
}










        
/////////
// --- 0. SPECIAL INTERACTIONS (Well & Bin) ---
        
        // A. WELL (Refill Water)
        let well = S.ents.find(e => e.kind === 'Well' && xIn(e, tx, ty));
        if (well) {
            S.farm.water = 30; // Reset to Max
            S.audio.play('well'); // AUDIO
            S.farm.justRefilled = true; // Tutorial Flag
            popText(tx, ty, "Refilled!", "#4fc3f7");
            part(tx, ty, '#00b0ff', 10); // Splash effect
            updateFarmUI();
            return;
        }

        // B. SHIPPING BIN (Sell Items)
        let bin = S.ents.find(e => e.kind === 'ShippingBin' && xIn(e, tx, ty));
        if (bin) {
            sellItems(tx, ty);
            return;
        }
///////////



// --- 0.5 INSTANT PICKUP (EGGS) ---
        if (S.farm.structures[k] === 'egg') {
            delete S.farm.structures[k]; // Remove from ground
            S.farm.inventory.egg++;      // Add to bag
            S.audio.play('item_found');  // AUDIO
            popText(tx, ty, "GOT EGG!", "#ffd700");
            updateFarmUI();
            return; // Stop here, don't open menu
        }







        // --- 1. CARRY SYSTEM ---
        if (S.carry) {
            
            // === A. SEED MODE ===
            if (S.carry.type === 'seed') {
                let plot = S.farm.plots[k];
                // Check if soil is tilled (stage 0)
                if (plot && plot.stage === 0) {
                    
                    // 1. DETERMINE CROP TYPE
                    // Map seed ID to crop Type. Default to 'carrot' for legacy 'carrot_seeds'.
                    let cropType = 'carrot'; // Default fallback
                    
                    if (S.carry.id === 'carrot_seeds') cropType = 'carrot'; // NEW NAME
                    else if (S.carry.id === 'potato_seeds') cropType = 'potato';
                    else if (S.carry.id === 'corn_seeds') cropType = 'corn';
                    else if (S.carry.id === 'tomato_seeds') cropType = 'tomato';
                    else if (S.carry.id === 'rose_seeds') cropType = 'rose';
                    else if (S.carry.id === 'sunflower_seeds') cropType = 'sunflower';
                    else if (S.carry.id === 'tulip_seeds') cropType = 'tulip';
                    else if (S.carry.id === 'lavender_seeds') cropType = 'lavender';

                    // 2. PLANT
                    plot.stage = 1; 
			S.farm.justPlanted = true; // Tutorial Flag
                    plot.crop = cropType; // SAVE TYPE TO PLOT
                    S.audio.play('plant'); // AUDIO
                    part(tx, ty, '#aed581', 5);
                    
                    // 3. AUTO-RELOAD
                    // Use the ID currently in hand (S.carry.id)
                    if (S.farm.inventory[S.carry.id] > 0) {
                        S.farm.inventory[S.carry.id]--; 
                        updateFarmUI();
                    } else {
                        S.carry = null; // Out of seeds
                        popText(p.x, p.y, "Empty", "#ccc");
                        updateFarmUI();
                    }
                } else {
                    popText(tx, ty, "Needs Tilled Soil", "#f00", false, true);
                }
                return;
            }





// === A.5 PLACE CHICKEN ===
            else if (S.carry.type === 'chicken_place') {
                // Check if the spot is blocked (by wall/fence/water)
                // Note: We use solid() but we don't need to ignore self here because the chicken isn't in the world yet.
                if (!solid(tx + 0.5, ty + 0.5)) {
                    addEnt('chicken', 'chicken', tx, ty);
                    S.carry = null; // Empty hands
                    S.audio.play('put_animal'); // AUDIO
                    popText(tx, ty, "Placed!", "#fff");
                } else {
                    popText(tx, ty, "Blocked", "#f00");
                }
                return;
            }





// === A.6 PLACE PET ===
            else if (S.carry.type === 'pet_place') {
                if (!solid(tx + 0.5, ty + 0.5)) {
                    addEnt('pet', S.carry.id, tx, ty);
                    S.carry = null;
                    S.audio.play('put_animal'); // AUDIO
                    popText(tx, ty, "Placed!", "#fff");
                } else {
                    popText(tx, ty, "Blocked", "#f00");
                }
                return;
            }





            // === B. PLACE MODE ===
            else if (S.carry.type === 'place') {
                let tile = S.map[ty*MAP_S+tx];
                
                // CHANGED: Removed 'T.ROAD' from the list. Now only Water and Walls are blocked.
                let invalidTile = (tile === T.WATER || tile === T.BEDROCK);
                
                let blocked = isBlocked(tx, ty) || S.farm.plots[k] || S.farm.debris[k] || S.farm.fences[k] || S.farm.structures[k];

                if (!invalidTile && !blocked) {
                    S.farm.structures[k] = S.carry.id;



                    
                   // --- UPDATE THIS BLOCK ---
                    if (S.carry.id === 'letter_brick') {
                        // Store Character 'A' and Color Index 0
                        S.farm.letterData[k] = { char: 'A', col: 0 }; 
                    }
                    // -------------------------

                    S.audio.play('put'); // AUDIO
                    popText(tx, ty, "PLACED", "#fff");
			S.farm.justPlaced = true;
                    S.carry = null; 
                } else {
                    popText(tx, ty, "Can't Place", "#f00");
                }
                return;
            }
        }






// --- 1.5 CHICKEN INTERACTION ---
        // --- 1.5 CHICKEN INTERACTION ---
        // Check if there is a chicken in front of us
        let chick = S.ents.find(e => e.type === 'chicken' && xIn(e, tx, ty));
        if (chick) {
            S.audio.play('btn_click'); // AUDIO: Open Menu
            S.menuTarget = chick; // Remember which chicken
            S.ui = 'chicken_opt'; // Open Chicken Menu
            S.menuSel = 0;        // Reset selection
            return;
        }







// --- 1.6 COW INTERACTION ---
        let cow = S.ents.find(e => e.type === 'cow' && xIn(e, tx, ty));
        if (cow) {
            S.audio.play('btn_click'); // AUDIO: Open Menu
            S.menuTarget = cow;
            S.ui = 'cow_opt'; // Opens the menu
            S.menuSel = 0;
            return;
        }




// --- 1.7 PET INTERACTION ---
        // FIXED: Select the pet even if it is slightly off-center
       let pet = S.ents.find(e => e.type === 'pet' && Math.round(e.x) === tx && Math.round(e.y) === ty);
        if (pet) {
            S.audio.play('btn_click'); // AUDIO: Open Menu
            S.menuTarget = pet;
            S.ui = 'pet_opt'; // Open Pet Menu
            S.menuSel = 0;
            return;
        }





        // --- 2. GROUND ITEM ---
        if (S.farm.structures[k]) {
            S.menuTarget = { x: tx, y: ty };
            S.ui = 'item_opt'; S.menuSel = 0; 
            return;
        }

        // --- 3. STANDARD INTERACTION ---
        // --- 3. STANDARD INTERACTION ---
        let booth = S.ents.find(e => e.kind === 'Telebooth' && xIn(e, tx, ty));
        if (booth) { 
            S.ui = 'shop'; 
            S.input.keys = {}; 
            
            // HIDE Tools & Hint (Stats stay visible)
            let bar = document.getElementById('skill-bar');
            let hint = document.getElementById('space-hint');
            if(bar) bar.style.display = 'none';
            if(hint) hint.style.display = 'none';
            

		// --- ADD THIS LINE ---
            let qp = document.getElementById('quest-panel');
            if(qp) qp.style.display = 'none';


            return; 
        }

        // UPDATED: Check for Apple OR Orange tree
        let tree = S.ents.find(e => (e.kind === 'tree_apple' || e.kind === 'tree_orange') && xIn(e, tx, ty));
        
        if (tree && tree.apples) {
            let index = tree.apples.findIndex(a => a === true);
            if (index !== -1) {
                tree.apples[index] = false; 
                
                // NEW: Determine which fruit to give
                let isOrange = (tree.kind === 'tree_orange');
                let item = isOrange ? 'orange' : 'apple';
                let icon = isOrange ? '🍊' : '🍎';

                S.farm.inventory[item] = (S.farm.inventory[item] || 0) + 1;
                S.audio.play('item_found'); // AUDIO
                popText(tx, ty, icon, "#fff", true, false, true);
                updateFarmUI();
                return; 
            }
        }





// [NEW] BED TRIGGER
        let bed = S.ents.find(e => e.kind === 'Bed' && xIn(e, tx, ty));
        if (bed) { 
            S.audio.play('btn_click'); // <--- ADD SOUND
            S.ui = 'sleep_opt'; 
            S.menuSel = 0; 
            return; 
        }




        
        // Tool Logic
        let toolName = S.farm.toolNames[S.farm.toolIndex];
        let lvl = S.farm.tools[toolName.toLowerCase()] || 1;


       const useTool = (gx, gy) => {
            let tk = `${gx},${gy}`;
            let obs = S.ents.find(e => e.type === 'obs' && xIn(e, gx, gy));
            let deb = S.farm.debris[tk];
            let tile = S.map[gy*MAP_S+gx];

            // --- 0. HAND LOGIC (Harvest & Hints) ---
            // --- 0. HAND LOGIC (Harvest Only) ---
            if(toolName === 'Hand') {
                if(S.farm.plots[tk] && S.farm.plots[tk].stage === 3) {
                    S.audio.play('pop'); // AUDIO
                    let type = S.farm.plots[tk].crop || 'carrot';
                    S.farm.inventory[type]++; 
                    delete S.farm.plots[tk];  
                    S.farm.justHarvested = true; 
                    popText(gx, gy, "+" + type.toUpperCase(), "#e67e22"); 
                    updateFarmUI(); 
                    return; 
                }
            }

           // --- 1. HAMMER LOGIC ---
            else if(toolName === 'Hammer') {
                // A. Smash Boulder (Gives 5 Bricks)
                if (obs && obs.kind === 'boulder') {
                    if (lvl >= 2) {
                        S.audio.play('rock'); // AUDIO
                        S.ents = S.ents.filter(e => e !== obs);
                        part(gx, gy, '#90a4ae', 12, 4); 
                        S.farm.inventory.brick += 5; 
                        S.farm.justCleared = true; // <--- ADDED TRIGGER
                        popText(gx, gy, "+5 🧱", "#fff", true); 
                        updateFarmUI();
                    } else {
                        popText(gx, gy, "Need Lv.2", "#ef5350", true);
                        S.audio.play('reminder'); // <--- UPDATED
                    }
                    return;
                }
                
                // B. Smash Stone (Just clears it - NO REWARD)
                if(deb === 'stone') {
                    S.audio.play('rock'); // AUDIO
                    delete S.farm.debris[tk]; 
                    part(gx, gy, '#b0bec5', 5);
                    S.farm.justCleared = true; // <--- TRIGGER ADDED
                    updateFarmUI(); return;
                }
                
                // C. Smash Fence (Gives Wood back)
                if(S.farm.fences[tk]) { 
                    delete S.farm.fences[tk]; 
                    S.farm.inventory.wood++; 
                    popText(gx, gy, "+1 🪵", "#fff");
                    updateFarmUI(); return; 
                }
            }

            // --- 2. AXE LOGIC ---
            else if(toolName === 'Axe') {
                // A. Chop Stump (Gives 5 Timber)
                if (obs && obs.kind === 'stump') {
                    if (lvl >= 2) {
                        S.audio.play('chop'); // AUDIO
                        S.ents = S.ents.filter(e => e !== obs);
                        part(gx, gy, '#8d6e63', 12, 4); 
                       S.farm.inventory.wood += 5; 
                        S.farm.justCleared = true; // <--- ADDED TRIGGER
                        popText(gx, gy, "+5 🪵", "#fff", true); 
                        updateFarmUI();
                    } else {
                        popText(gx, gy, "Need Lv.2", "#ef5350", true);
                        S.audio.play('reminder'); // <--- UPDATED
                    }
                    return;
                }
                
                // B. Chop Branch
                if(deb === 'branch') {
                    S.audio.play('chop'); // AUDIO
                    delete S.farm.debris[tk]; 
                    part(gx, gy, '#d7ccc8', 5);
                    S.farm.justCleared = true; // <--- TRIGGER ADDED
                    updateFarmUI(); return;
                }
            }



            // --- 3. SICKLE LOGIC (Weeds Only) ---
            else if(toolName === 'Sickle') {
                // Action: Clear Weeds
               if(deb === 'weed') { 
                    S.audio.play('sickle'); // AUDIO
                    delete S.farm.debris[tk]; 
                    part(gx, gy, '#76ff03', 5); 
                    S.farm.justCleared = true; // <--- TRIGGER ADDED
                    return; 
                }
                
                // (Harvest Logic REMOVED from here)
            }
            
            // --- 4. WATERING CAN ---
            else if(toolName === 'Water') {
                if(S.farm.plots[tk]) { 
                    if (S.farm.water > 0) {
                        S.audio.play('water'); // AUDIO
                        S.farm.plots[tk].watered = true;
                        S.farm.water--; 
			S.farm.justWatered = true; // Tutorial Flag
                        part(gx, gy, '#00b0ff', 5, 2); 
                        updateFarmUI(); 
                    } else {
                        popText(gx, gy, "Empty!", "#ef5350", true);
                    }
                }
            }

            // --- 5. HOE LOGIC ---
            else if(toolName === 'Hoe') {
                if (isFarmable(gx, gy)) {
                    let t = S.map[gy*MAP_S+gx];
                    if (t === T.GRASS && !S.farm.plots[tk] && !isBlocked(gx, gy)) {
                        S.audio.play('hoe'); // AUDIO
                        S.farm.plots[tk] = { stage: 0, watered: false };
			S.farm.justTilled = true; // Tutorial Flag
                        part(gx, gy, '#5d4037', 5);
                    }
                }
            }




            
            // [THE MEAT] --- PASTE THIS NEW CODE HERE (Replacing the old Rod Logic) ---
        // [THE MEAT] --- PASTE THIS (Trigger at 10) ---
       // --- 6. ROD LOGIC (The "Shortcut" Edition) ---
        else if(toolName === 'Rod') {
            if(tile === T.WATER) {
                S.audio.play('fishing'); 
                part(gx, gy, '#00b0ff', 5);
                
                setTimeout(() => {
                    if(Math.random() < 0.4) { 
                        S.farm.inventory.fish++; 
                        S.audio.play('item_found'); 
                        
                        // --- THE JOKE LOGIC ---
                        S.farm.fishSpam = (S.farm.fishSpam || 0) + 1;

// [THE MEAT] --- PASTE THIS BLOCK ---
                        if (S.farm.fishSpam >= 10 && !hasShownJoke) {
                            showChat("SECRET UNLOCKED 🤪", "Oops, you found the shortcut to get rich!", 4000);
                            popText(S.p.x, S.p.y, "🐟", "#fff", true, false, true); 
                            hasShownJoke = true; // Lock it!
                        } 
                        else {
                            popText(S.p.x, S.p.y, "🐟", "#fff", true, false, true); 
                        }
// -----------------------------------

                        updateFarmUI(); 
                    } 
                    else {
                        popText(S.p.x, S.p.y, "...", "#aaa", false, true);
                    }
                }, 800); 
            }
        }

            // --- 7. FALLBACK HINTS ---
            // --- 7. FALLBACK HINTS ---
            // Triggers if no specific tool matched the object
            if (deb || obs) {
                // Play sound if any hint is triggered
                if (['weed','stone','branch'].includes(deb) || (obs && (obs.kind==='boulder'||obs.kind==='stump'))) {
                    S.audio.play('reminder'); 
                }
            }

            if(deb === 'weed') popText(gx, gy, "Use Sickle", "#ffa726", true);
            else if(deb === 'stone') popText(gx, gy, "Use Hammer", "#ffa726", true);
            else if(deb === 'branch') popText(gx, gy, "Use Axe", "#ffa726", true);
            else if(obs && obs.kind === 'boulder') popText(gx, gy, "Use Hammer", "#ffa726", true);
            else if(obs && obs.kind === 'stump') popText(gx, gy, "Use Axe", "#ffa726", true);

        }; // End of useTool




        // --- EXECUTE TOOL ---
       // --- EXECUTE TOOL ---
        useTool(tx, ty); 

        // --- LEVEL 2 AREA EFFECT (3 Tiles) ---
        // Note: toolName for Water Can is 'Water'
        if(lvl >= 2 && ['Hoe','Water','Sickle'].includes(toolName)) {
            
            // 1. Water Consumption Multiplier
            // If we are watering 3 tiles, we need to consume 2 more units of water
            if(toolName === 'Water' && S.farm.water >= 2) S.farm.water -= 2;

            if(p.dir === 0 || p.dir === 2) { // Up/Down -> Spread Left/Right
                useTool(tx-1, ty); 
                useTool(tx+1, ty); 
            } else { // Left/Right -> Spread Up/Down
                useTool(tx, ty-1); 
                useTool(tx, ty+1); 
            }
        }
    }



/////////
    // --- Helpers ---
    function sellItems(x, y) {
        let inv = S.farm.inventory;
        
        // Prices
        let prices = {
            carrot: 60, potato: 60, corn: 80, tomato: 80,
            rose: 100, sunflower: 100, tulip: 90, lavender: 90,
            fish: 30, apple: 40, orange: 40, milk: 50, egg: 25
        };

        let total = 0;
        for (let item in prices) {
            if (inv[item] > 0) {
                total += inv[item] * prices[item];
                inv[item] = 0; // Sell all
            }

S.farm.justSold = true; // Signal for tutorial
        }

        if(total > 0) {
            S.farm.money += total;
            S.audio.play('sell'); // AUDIO
            popText(x, y, `SOLD! +${total}g`, '#ffd700');
            updateFarmUI();
        } else {
            popText(x, y, "Nothing to Sell", '#aaa');
        }
    }





    function sleep() {
        S.audio.play('rooster'); // AUDIO
        S.audio.playBGM('farm_day'); // Reset BGM to day


       // Advance Day
        S.farm.day++;
        S.farm.time = 360; 
        S.p.hp = S.p.maxHp;

        // --- NEW DAY WEATHER ---
        S.farm.weather = (Math.random() < 0.35) ? 'rain' : 'sun';





        // --- SMART SAVE LOGIC ---
        // Scenario B: Bound File (Auto-Save)
        if (S.curSlot) {
            saveGame(S.curSlot); 
            // Silent Save (No text)
        } 
        // Scenario A: New Game / Unbound (Ask Player)
        else {
            triggerSaveUI(); 
        }

        // --- WEATHER LOGIC ---

    // --- WEATHER LOGIC ---

        // --- WEATHER LOGIC ---
        // 20% Chance of Rain tomorrow
        S.farm.weather = (Math.random() < 0.35) ? 'rain' : 'sun';
        
        // --- DEBRIS REGENERATION (Every 3 Days) ---

        // --- DEBRIS REGENERATION (Every 3 Days) ---
        if (S.farm.day % 3 === 0) {
            // Iterate Main Field Area (124,141 to 137,150)
            for (let y = 141; y <= 150; y++) {
                for (let x = 124; x <= 137; x++) {
                    let k = `${x},${y}`;
                    
                    // 1. Safety Check: Don't spawn on top of existing Debris, Fences, or Buildings
                    if (S.farm.debris[k] || S.farm.fences[k] || S.farm.structures[k]) continue;

                    let spawn = false;

                    // 2. Case A: Destroy Existing Crop/Soil (15% Chance)
                    if (S.farm.plots[k]) {
                        // This makes "planting item become debris"
                        if (Math.random() < 0.15) {
                            delete S.farm.plots[k]; // Remove the crop/soil
                            spawn = true;
                        }
                    }
                    // 3. Case B: Spawn on Empty Ground (10% Chance)
                    else {
                        if (Math.random() < 0.10) spawn = true;
                    }
// 4. Generate the Debris
                    if (spawn) {
                        let r = Math.random();
                        let type = r < 0.33 ? 'stone' : (r < 0.66 ? 'branch' : 'weed');
                        S.farm.debris[k] = type;
                    }
                }
            }
            // CLEANER: Show in chat instead of floating text
            // (Message removed)
        }


        
        // Crop Growth Logic
        for(let k in S.farm.plots) {
            let plt = S.farm.plots[k];
            
            // BUG FIX: Only grow if watered AND has a seed (Stage > 0)
            if(plt.watered && plt.stage > 0) {
                plt.stage++;
                plt.watered = false; // Dry out the soil
                if(plt.stage > 3) plt.stage = 3; // Cap at max growth
            }
            
            // Note: If stage is 0 (empty dirt), we just dry it out without growing
            // Note: If stage is 0 (empty dirt), we just dry it out without growing
            if(plt.stage === 0 && plt.watered) {
                plt.watered = false; 
            }
            
            // AUTO-WATER IF RAINING
            if(S.farm.weather === 'rain') {
                plt.watered = true;
            }
        }


        S.farm.dayNoticeTimer = 180;
        S.ui = 'none'; // Close the sleep menu
        updateFarmUI();


// CHICKEN EGG PRODUCTION
        // ANIMAL UPDATE (Eggs & Milk) & FRUIT REGEN
        S.ents.forEach(e => {
            // 1. Chickens lay eggs
            // 1. Chickens lay eggs (Smart Search + 80% Chance)
            if (e.type === 'chicken') {
                // CHANGE THIS NUMBER: 0.8 = 80% chance, 1.0 = 100% Guaranteed
                if (Math.random() < 0.8) { 
                    let tx = Math.round(e.x), ty = Math.round(e.y);
                    
                    // All 8 surrounding tiles
                    let offsets = [
                        {x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1},
                        {x:1,y:1}, {x:1,y:-1}, {x:-1,y:1}, {x:-1,y:-1}
                    ];
                    // Shuffle checks so egg placement looks natural/random
                    offsets.sort(() => Math.random() - 0.5);

                    for (let o of offsets) {
                        let ex = tx + o.x;
                        let ey = ty + o.y;
                        let k = `${ex},${ey}`;
                        
                       // Check: Not Solid, No Structure, AND NO SOIL/CROP
                        if (!solid(ex+0.5, ey+0.5) && !S.farm.structures[k] && !S.farm.plots[k]) {
                             S.farm.structures[k] = 'egg';
                             break; // Laid an egg, stop looking
                        }
                    }
                }
            }
            // 2. Cows reset milk
            if (e.type === 'cow') {
                e.milked = false;
            }
            // 3. Trees regrow fruit
            if (e.kind === 'tree_apple' || e.kind === 'tree_orange') {
                e.apples = [true, true, true];
            }
        });





S.farm.justSlept = true; // Signal for tutorial
    }


//////////////////////////

// --- LOCAL UPGRADE FUNCTIONS (Fixes Shop Buttons) ---
    
    // --- LOCAL UPGRADE FUNCTIONS (With Sound Effects) ---
    
    function upgradeHouse(p) {
        if (S.farm.houseLevel >= 3) {
            popText(S.p.x, S.p.y, "MAX (LV.3)", "#aaa"); 
            S.audio.play('error'); 
            return;
        }
        if(S.farm.money >= p) {
            S.audio.play('buy'); // <--- SOUND ADDED
            S.farm.money -= p; 
            S.farm.houseLevel++;
            
            // Visual Update
            let h = S.ents.find(e => e.kind === 'FarmHouse');
            if(h) h.w = (S.farm.houseLevel >= 2) ? 9 : 7;
            
            let bed = S.ents.find(e => e.kind === 'Bed');
            if(bed && S.farm.houseLevel === 2) bed.x += 2; 

            popText(S.p.x, S.p.y, "HOUSE LV." + S.farm.houseLevel + "!", "#ffd700");
            updateFarmUI();
        } else {
            S.audio.play('error'); // <--- SOUND ADDED
            popText(S.p.x, S.p.y, "No Funds", "#f00");
        }
    }

    function upgradeField(p) {
         if (S.farm.fieldLevel >= 3) {
             popText(S.p.x, S.p.y, "MAX (LV.3)", "#aaa"); 
             S.audio.play('error');
             return;
         }
         if(S.farm.money >= p) {
             S.audio.play('buy'); 
             S.farm.money -= p; 
             S.farm.fieldLevel++;
             popText(S.p.x, S.p.y, "FIELD EXPANDED!", "#ffd700");
             updateFarmUI();
         } else {
             S.audio.play('error');
             popText(S.p.x, S.p.y, "No Funds", "#f00");
         }
    }

    function upgradeGarden(p) {
        let gl = S.farm.gardenLevel || 1;
        if (gl >= 2) {
            popText(S.p.x, S.p.y, "MAX (LV.2)", "#aaa"); 
            S.audio.play('error');
            return;
        }
        if(S.farm.money >= p) {
            S.audio.play('buy'); 
            S.farm.money -= p;
            S.farm.gardenLevel = gl + 1;
            popText(S.p.x, S.p.y, "GARDEN EXPANDED!", "#ffd700");
            updateFarmUI();
        } else {
            S.audio.play('error');
            popText(S.p.x, S.p.y, "No Funds", "#f00");
        }
    }

    function buy(it, p) {
        // A. PET BUY
        if (it === 'dog' || it === 'cat') {
            if (S.ents.find(e => e.type === 'pet' && e.kind === it)) { 
                popText(S.p.x, S.p.y, "Have " + it, "#ef5350"); 
                S.audio.play('error');
                return; 
            }
            if (S.farm.money >= p) {
                S.audio.play('buy');
                S.farm.money -= p;
                addEnt('pet', it, 132, 133);
                popText(S.p.x, S.p.y, "New Friend!", "#fff");
                updateFarmUI();
            } else {
                S.audio.play('error');
                popText(S.p.x, S.p.y, "No Funds", "#f00");
            }
            return;
        }
        // B. ANIMAL BUY
        if (it === 'chicken' || it === 'cow' || it === 'horse') {
            if (it === 'horse' && (S.ents.find(e => e.kind === 'horse') || S.p.isRiding)) { 
                popText(S.p.x, S.p.y, "One Horse Only!", "#ef5350"); 
                S.audio.play('error');
                return; 
            }
            if (S.ents.filter(e => e.type === it).length >= 16) { 
                popText(S.p.x, S.p.y, "MAX LIMIT", "#ef5350"); 
                S.audio.play('error');
                return; 
            }
            
            let sx = null, sy = null;
            for(let y=132; y<=135; y++) for(let x=126; x<=138; x++) if(!solid(x+0.5, y+0.5)) { sx=x; sy=y; x=999; y=999; }
            
            if (S.farm.money >= p && sx) {
                S.audio.play('buy');
                S.farm.money -= p;
                addEnt(it, it, sx, sy);
                popText(S.p.x, S.p.y, it.toUpperCase() + "!", "#fff");
                updateFarmUI();
            } else {
                S.audio.play('error');
                popText(S.p.x, S.p.y, S.farm.money<p?"No Funds":"Yard Full!", "#f00");
            }
            return;
        }
        // C. TOOL UPGRADE CHECK
        if (['hoe','sickle','hammer','axe','water'].includes(it)) {
            if ((S.farm.tools[it]||1) >= 2) { 
                popText(S.p.x, S.p.y, "MAX (LV.2)", "#ef5350"); 
                S.audio.play('error');
                return; 
            }
        }
        // D. GENERIC ITEM
        if(S.farm.money >= p) {
            S.audio.play('buy');
            S.farm.money -= p;
            if(['hoe','sickle','hammer','axe','water'].includes(it)) S.farm.tools[it]++;
            else S.farm.inventory[it] = (S.farm.inventory[it]||0) + 1;
            
            S.farm.justBought = true; // <--- FIXED: Now counts for Seeds too! 

            popText(S.p.x, S.p.y, "BOUGHT!", "#ffd700");
            updateFarmUI(); 
        } else {
            S.audio.play('error');
            popText(S.p.x, S.p.y, "No Funds", "#f00");
        }
    }















////////////////////////

  // --- UI Update (Fixed: Clean Font for ~) ---
   // --- REPLACE THE ENTIRE updateFarmUI FUNCTION ---

 function updateFarmUI() {

// --- START OF NEW FIX ---
    // ADDED: 'bag_opt' and 'isBoating' to keep UI hidden
    if (S.ui === 'shop' || S.ui === 'bag' || S.ui === 'bag_opt' || S.ui === 'letter_edit' || S.p.isBoating) {
        let bar = document.getElementById('skill-bar');
        let hint = document.getElementById('space-hint');


        let quest = document.getElementById('quest-panel');
        if(bar) bar.style.display = 'none';
        if(hint) hint.style.display = 'none';
        if(quest) quest.style.display = 'none';
        return; // Stop here so they don't reappear
    } else {
        // Make sure they are visible when menu closes
        let bar = document.getElementById('skill-bar');
        let hint = document.getElementById('space-hint');
        if(bar) bar.style.display = ''; 
        if(hint) hint.style.display = 'flex';
    }
    // --- END OF NEW FIX ---






        // We removed the DOM text updates for Day/Money because they are now on Canvas.
        
        // 1. SKILL BAR UPDATE
        let bar = document.getElementById('skill-bar');
        if(!bar) return;
        bar.innerHTML = ''; 

        // 2. BAG BUTTON
        let bagBtn = document.createElement('div');
        bagBtn.className = 'slot-base bag-slot'; 
        bagBtn.innerHTML = `
            <span style="font-size:34px; font-family:Verdana, sans-serif; font-weight:bold; color:#fff; line-height:30px; margin-bottom:5px">~</span>
            <div style="font-size:32px">🎒</div>
            <span style="font-size:14px; font-weight:bold;">BAG</span>
        `;
        bagBtn.onclick = () => toggleChest();
        bar.appendChild(bagBtn);

        // 3. TOOL BUTTONS
        // 3. TOOL BUTTONS
        // Loop limit changed to 7 (Hides [R] Slot)
        for(let i=0; i<7; i++) {
            let name = S.farm.toolNames[i];
            let icon = S.farm.toolIcons[i];
            let keyChar = S.farm.keyMap[i];
            let isActive = S.farm.toolIndex === i;
            let qty = (name === 'Stake') ? S.farm.inventory.stake : (name === 'carrot_seeds' ? S.farm.inventory.seeds : '');

            let slot = document.createElement('div');
            slot.className = `slot-base ${isActive ? 'active-tool' : ''}`;
            
            slot.innerHTML = `
                <span style="position:absolute; top:3px; left:5px; font-size:16px; color:#ddd; font-family:monospace; font-weight:bold;">${keyChar}</span>
                <div style="font-size:28px; margin-top:5px;">${icon}</div>
                <div style="position:absolute; bottom:2px; right:4px; font-size:14px; color:#fff;">${qty}</div>
            `;
            slot.onclick = () => { S.farm.toolIndex = i; updateFarmUI(); };
            bar.appendChild(slot);
        }

        // 4. SPACE HINT UPDATE
        let spaceBtn = document.getElementById('space-hint');
        if(spaceBtn) {
            let currentIcon = S.farm.toolIcons[S.farm.toolIndex];
            let currentName = S.farm.toolNames[S.farm.toolIndex];
            
            spaceBtn.innerHTML = `
                <div style="font-size:14px; color:#ccc; font-family:monospace; margin-bottom:-5px; font-weight:bold; text-transform:uppercase;">${currentName}</div>
                <div id="space-icon" style="margin-bottom:0px;">${currentIcon}</div>
                <div id="space-text">SPACE</div>
            `;
            
            let txt = spaceBtn.querySelector('#space-text');
            txt.style.color = (currentName === 'Hand') ? '#ccc' : '#ffd700';
            
            let ico = spaceBtn.querySelector('#space-icon');
            ico.style.fontSize = "40px";
        }

// --- [FIX] PREVENT UI TAKEOVER ON DRIVEWAY ---
        // Only update the text if we are actually inside the farm (Past x=118).
        // This keeps the RPG "Current Mission" text visible while walking on the bridge.
        if (S.p.x <= 118) return; 
        // ---------------------------------------------





// UPDATE QUEST PANEL TEXT
       // UPDATE QUEST PANEL TEXT
        let qPanel = document.getElementById('quest-txt');
        let qTitle = document.getElementById('quest-panel');
        
        if (qPanel && qTitle) {
            let step = S.farm.tutorialStep || 0;
            
            // SAFETY CHECK: Does this step actually exist?
            if (step < TUTORIAL_STEPS.length && TUTORIAL_STEPS[step]) {
                qTitle.style.display = 'block'; 
                qTitle.children[0].innerText = "FARM TUTORIAL"; 
                
                let data = TUTORIAL_STEPS[step];
                qPanel.innerHTML = data.txt; // Safe to access .txt now
                qPanel.style.color = "#fff"; 
            } else {
                // If step is too high (Done), hide the box
                qTitle.style.display = 'none';
            }
        }



    }


////////////////////////


    // --- Helper: Show Screen Hint (Added at the end) ---
    function showHint(text) {
        let el = document.getElementById('screen-hint');
        if(el) {
            el.innerText = text; el.style.opacity = 1; el.style.top = '45%';
            if(el.timer) clearTimeout(el.timer);
            el.timer = setTimeout(() => { el.style.opacity = 0; el.style.top = '50%'; }, 1000);
        }
    }


//////////////////////////

    function toggleChest() {
        let m = document.getElementById('chest-menu');
        if(m.style.display==='block') { m.style.display='none'; return; }
        m.style.display='block';
        renderChest();
    }



    function renderChest() {
        let g = document.getElementById('chest-grid');
        g.innerHTML = '';
        
        let allItems = [
            'carrot_seeds','potato_seeds','corn_seeds','tomato_seeds','rose_seeds','sunflower_seeds','tulip_seeds','gyp_seeds',
            'carrot','potato','corn','tomato','rose','sunflower','tulip','gypsophila',
            'wood','brick','apple','orange','fish'
        ];

        allItems.forEach(it => {
            // Only show if we actually have some (Cleaner UI)
            if ((S.farm.inventory[it]||0) > 0 || (S.farm.storage[it]||0) > 0) {
                g.innerHTML += `<button class="farm-btn" onclick="Region9Farm.swapItem('${it}')">
                ${it.toUpperCase()}: Inv(${S.farm.inventory[it]||0}) | Box(${S.farm.storage[it]||0})
                </button>`;
            }
        });
    }




    function toggleSleepMenu() {
        let m = document.getElementById('sleep-menu');
        m.style.display = m.style.display==='block'?'none':'block';
    }

//////////////////////////


	// --- BAG DATA & LOGIC (Refined Design) ---
const BAG_CATS = [
    // Tab 0: SEEDS (NATURE)
    [
        {id:'carrot_seeds', icon:'🥕', name:'Carrot Seeds', desc:'Plant in Spring.'}, 
        {id:'potato_seeds', icon:'🥔', name:'Potato Seeds', desc:'Plant in Spring.'}, 
        {id:'corn_seeds', icon:'🌽', name:'Corn Seeds', desc:'Plant in Summer.'}, 
        {id:'tomato_seeds', icon:'🍅', name:'Tom. Seeds', desc:'Plant in Summer.'},
        {id:'rose_seeds', icon:'🌹', name:'Rose Seeds', desc:'Red flower.'}, 
        {id:'sunflower_seeds', icon:'🌻', name:'Sunflr Seeds', desc:'Tall flower.'}, 
        {id:'tulip_seeds', icon:'🌷', name:'Tulip Seeds', desc:'Spring bulb.'}, 
        {id:'lavender_seeds', icon:'🪻', name:'Lav. Seeds', desc:'Purple herb.'}
    ],
    // Tab 1: GOODS (PRODUCE & ANIMALS)
    [
        {id:'carrot', icon:'🥕', name:'Carrot', desc:'Crunchy snack.'}, 
        {id:'potato', icon:'🥔', name:'Potato', desc:'Boil or mash.'},
        {id:'corn', icon:'🌽', name:'Corn', desc:'Sweet yellow.'},
        {id:'tomato', icon:'🍅', name:'Tomato', desc:'Red fruit.'},
        {id:'rose', icon:'🌹', name:'Rose', desc:'Love symbol.'}, 
        {id:'sunflower', icon:'🌻', name:'Sunflower', desc:'Sunny.'}, 
        {id:'tulip', icon:'🌷', name:'Tulip', desc:'Colorful.'}, 
        {id:'lavender', icon:'🪻', name:'Lavender', desc:'Smells nice.'},
        {id:'apple', icon:'🍎', name:'Apple', desc:'Tree fruit.'}, 
        {id:'orange', icon:'🍊', name:'Orange', desc:'Citrus fruit.'},
        {id:'fish', icon:'🐟', name:'Fish', desc:'River caught.'}, 
        {id:'egg', icon:'🥚', name:'Egg', desc:'Laid by chicken.'}, 
        {id:'milk', icon:'🥛', name:'Milk', desc:'From a cow.'}
    ],
    // Tab 2: DECOR (BUILD & DECORATE)
    [
        {id:'wood', icon:'🪵', name:'Timber', desc:'Used for crafting.'}, 
        {id:'brick', icon:'🧱', name:'Brick', desc:'Solid stone block.'}, 
        {id:'letter_brick', icon:'🔠', name:'Letter Blk', desc:'Custom text.'},
        {id:'star', icon:'⭐', name:'Star', desc:'Decoration.'}, 
        {id:'bal_r', icon:'🎈', name:'Red Balloon', desc:'Party time!'}, 
        {id:'bal_y', icon:'🎈', name:'Yel Balloon', desc:'Party time!'}, 
        {id:'bal_b', icon:'🎈', name:'Blue Balloon', desc:'Party time!'},
        {id:'teddy', icon:'🧸', name:'Teddy Bear', desc:'Cute toy.'}, 
        {id:'qbox', icon:'❓', name:'Q-Box', desc:'Mystery.'}, 
        {id:'coin', icon:'🪙', name:'Big Coin', desc:'Shiny.'}
    ]
];

function toggleBag() {
        let bar = document.getElementById('skill-bar');
        let spaceBtn = document.getElementById('space-hint');
        // We do NOT select 'farm-stats' here, so it stays visible.

        if (S.ui === 'bag') {
            // === Closing Bag ===
            S.audio.play('esc'); // <--- CHANGE 'bag' TO 'esc' HERE
            S.ui = 'none';
            showHint("Bag Closed");
            
            // Show Tools & Hint
            if(bar) bar.style.display = ''; 
            if(spaceBtn) spaceBtn.style.display = 'flex';
        } else {
            // === Opening Bag ===
            S.audio.play('bag'); // AUDIO
            S.ui = 'bag';
            S.bag.cx = 0; S.bag.cy = 0; 
            showHint("Bag Opened");
            
            // Hide Tools & Hint
            if(bar) bar.style.display = 'none';
            if(spaceBtn) spaceBtn.style.display = 'none';

		// --- ADD THIS LINE ---
            let qp = document.getElementById('quest-panel');
            if(qp) qp.style.display = 'none';
        }
    }

function getBagItemAt(tabIdx, cx, cy) {
    let items = BAG_CATS[tabIdx];
    let index = cy * 4 + cx; 
    return (index < items.length) ? items[index] : null; 
}

function drawBag() {
    // --- DESIGN SETTINGS ---
    const boxW = 340;
    const boxH = 520; 
    const mx = (cvs.width - boxW) / 2;
    const my = (cvs.height - boxH) / 2;

    const C_PAPER  = '#fff3e0'; // Cream / Parchment
    const C_INK    = '#3e2723'; // Dark Brown Text
    const C_BORDER = '#5d4037'; // Frame Color
    const C_ACCENT = '#ffb74d'; // Highlight Color

    // 1. Background Frame
    ctx.fillStyle = C_PAPER;
    ctx.fillRect(mx, my, boxW, boxH);
    
    // Outer Border
    ctx.strokeStyle = C_BORDER; ctx.lineWidth = 6;
    ctx.strokeRect(mx, my, boxW, boxH);
    // Inner Border Line
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 1;
    ctx.strokeRect(mx+5, my+5, boxW-10, boxH-10);

    // 2. Tabs (SEEDS / GOODS / DECOR)
    // 2. Tabs (SEEDS / GOODS / DECOR)
    ctx.font = "bold 15px monospace";
    let tabs = ["SEEDS", "GOODS", "DECOR"];
    
    // Calculate width per tab (Box Width / 3) to space them evenly
    let tabWidth = boxW / 3; 

    for(let i=0; i<tabs.length; i++) {
        // Calculate Center X for this tab
        let tx = mx + (i * tabWidth) + (tabWidth / 2);
        let ty = my + 35;
        
        // Active Tab Highlight
        if(S.bag.tab === i) {
            ctx.fillStyle = C_ACCENT; 
            // Draw box centered on tx (Width 80 -> Offset -40)
            ctx.fillRect(tx - 40, ty - 15, 80, 25); 
            ctx.fillStyle = C_INK;
        } else {
            ctx.fillStyle = '#a1887f'; 
        }

        // Draw Text Centered
        ctx.textAlign = "center";
        ctx.fillText(tabs[i], tx, ty);
        ctx.textAlign = "left"; // Reset alignment
    }

    // 3. Inventory Grid
    let slotSize = 55; 
    let gap = 12;      
    let gridStartX = mx + (boxW - (4*slotSize + 3*gap)) / 2; 
    let gridStartY = my + 65; 

    for(let y=0; y<5; y++) {
        for(let x=0; x<4; x++) {
            let dx = gridStartX + x * (slotSize + gap);
            let dy = gridStartY + y * (slotSize + gap);

            // Slot Background
            ctx.fillStyle = 'rgba(62, 39, 35, 0.05)';
            ctx.fillRect(dx, dy, slotSize, slotSize);
            ctx.strokeStyle = '#d7ccc8'; ctx.lineWidth = 1;
            ctx.strokeRect(dx, dy, slotSize, slotSize);

            // Draw Item
            let item = getBagItemAt(S.bag.tab, x, y);
            if (item) {
                let qty = S.farm.inventory[item.id] || 0;
                
                // Seed Packet Style
                if (item.id.includes('seed')) {
                     ctx.fillStyle = '#fff'; ctx.fillRect(dx+10, dy+10, 35, 35);
                     ctx.strokeStyle = '#ccc'; ctx.strokeRect(dx+10, dy+10, 35, 35);
                     ctx.font = "20px serif"; ctx.textAlign = "center"; ctx.textBaseline="middle";
                     ctx.fillText(item.icon, dx+slotSize/2, dy+slotSize/2);
                     ctx.textAlign = "left"; ctx.textBaseline="alphabetic";
                } else {
                     // Normal Item
                     ctx.font = "32px serif"; ctx.textAlign = "center";
                     ctx.fillStyle = (qty > 0) ? '#000' : 'rgba(0,0,0,0.2)';
                     ctx.fillText(item.icon, dx + slotSize/2, dy + 38);
                     ctx.textAlign = "left"; 
                }

                // Quantity Count
                if (qty > 0) {
                    ctx.font = "bold 12px monospace";
                    ctx.fillStyle = C_INK;
                    ctx.fillText(qty, dx + 4, dy + 14);
                }
            }

            // Cursor Selection (Thick Brown Box)
            if (S.bag.cx === x && S.bag.cy === y) {
                ctx.strokeStyle = C_INK; ctx.lineWidth = 3;
                ctx.strokeRect(dx-1, dy-1, slotSize+2, slotSize+2);
            }
        }
    }

    // 4. Description Box (Bottom Panel)
    let descY = my + boxH - 80; 
    ctx.fillStyle = '#d7ccc8'; ctx.fillRect(mx+10, descY - 5, boxW-20, 2); // Separator Line

    let selItem = getBagItemAt(S.bag.tab, S.bag.cx, S.bag.cy);
    
    // Right Alignment X Coordinate
    let hintX = mx + boxW - 25;

    if(selItem) {
        // Name & Description (Left Side)
        ctx.fillStyle = C_INK; ctx.font = "bold 18px sans-serif";
        ctx.fillText(selItem.name, mx + 25, descY + 25);
        
        ctx.fillStyle = '#5d4037'; ctx.font = "italic 14px serif";
        ctx.fillText(selItem.desc || "No description.", mx + 25, descY + 48);
        
        // [SPC] USE (Right Side - Green)
        const blocked = ['carrot','potato','corn','tomato','apple','orange','fish','egg','milk'];
        if (!blocked.includes(selItem.id)) {
            ctx.textAlign = "right";
            ctx.font = "bold 12px monospace";
            ctx.fillStyle = '#2e7d32'; 
            ctx.fillText("[SPC] USE", hintX, descY + 30);
            ctx.textAlign = "left";
        }
    } else {
        ctx.fillStyle = '#a1887f'; ctx.font = "italic 16px sans-serif";
        ctx.fillText("Empty Slot", mx + 25, descY + 35);
    }

    // [ESC] CLOSE (Right Side - Red - Always Visible)
    ctx.textAlign = "right";
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = '#c62828'; 
    ctx.fillText("[ESC] CLOSE", hintX, descY + 52);
    ctx.textAlign = "left"; 
}
















/////////////////////////
function draw() {




        // 1. Clear Screen
        ctx.fillStyle='#000'; ctx.fillRect(0,0,cvs.width,cvs.height);
        
        let sx = (Math.random()-0.5)*(S.shake||0);
        let cx = Math.floor(S.cam.x/TILE), cy = Math.floor(S.cam.y/TILE);
        let ex = cx + (cvs.width/TILE)+2, ey = cy + (cvs.height/TILE)+2;




// --- [MEAT] NEW CODE TO PASTE ---
        // 1. SKY LAYER (Layer 0.2)
        // Range: x=200 to 260. Height: 16 tiles (y=104 to 120)
        // 1. SKY LAYER (Layer 0.2)
      // 1. SKY LAYER (Layer 0.2) - DYNAMIC SUN/MOON CYCLE
       // 1. SKY LAYER (Layer 0.2) - DYNAMIC SUN/MOON CYCLE
        // Range: x=200 to 260. Height: 16 tiles (y=104 to 120)
// 1. SKY LAYER (Layer 0.2) - REALISTIC ASYMMETRIC CYCLE & VOLUMETRIC CLOUDS
        // Range: x=200 to 260. Height: 16 tiles (y=104 to 120)
       // 1. SKY LAYER (Layer 0.2) - REALISTIC ASYMMETRIC CYCLE & VOLUMETRIC CLOUDS
        // Range: x=200 to 295 (Updated). Height: 16 tiles.
        let skyStartX = 200 * TILE - S.cam.x + sx;
        
        // CHANGE THIS LINE: 75 -> 95
        let skyW      = 95 * TILE; 
        
        let skyBaseY  = 120 * TILE - S.cam.y;
        let skyH      = 16 * TILE;
        let skyTopY   = skyBaseY - skyH;

        if (skyStartX + skyW > 0 && skyStartX < cvs.width) {
            
            let m = S.farm.time;

            // --- A. HELPERS ---
            const lerp = (start, end, p) => start + (end - start) * p;
            const lerpColor = (c1, c2, p) => {
                p = Math.max(0, Math.min(1, p));
                return {
                    r: Math.round(lerp(c1.r, c2.r, p)),
                    g: Math.round(lerp(c1.g, c2.g, p)),
                    b: Math.round(lerp(c1.b, c2.b, p)),
                    a: lerp(c1.a, c2.a, p)
                };
            };
            const colStr = (c) => `rgba(${c.r},${c.g},${c.b},${c.a})`;

            // --- B. REALISTIC PALETTE (Asymmetric) ---
            const SKY_KEYS = {
                NIGHT:      { t:{r:10, g:15, b:40, a:1},   b:{r:20, g:40, b:90, a:1} },  // Deep Navy
                
                // SUNRISE (Cool, Crisp, Pale)
                DAWN_EARLY: { t:{r:25, g:30, b:80, a:1},   b:{r:200,g:180,b:140, a:1} }, // Indigo to Pale Wheat
                DAWN_BRIGHT:{ t:{r:70, g:150,b:230, a:1},  b:{r:255,g:250,b:200, a:1} }, // Sky Blue to Lemon

                // DAY (Bright)
                DAY:        { t:{r:0,  g:160,b:240, a:1},  b:{r:240,g:250,b:255, a:1} }, // Azure to White
                
                // SUNSET (Warm, Heavy, Burning)
                GOLDEN:     { t:{r:40, g:100,b:180, a:1},  b:{r:255,g:190,b:60,  a:1} }, // Deep Blue to Gold
                SUNSET_RED: { t:{r:50, g:40, b:90,  a:1},  b:{r:255,g:70, b:20,  a:1} }, // Violet to Burning Orange
                TWILIGHT:   { t:{r:20, g:20, b:50,  a:1},  b:{r:160,g:60, b:80,  a:1} }  // Navy to Dull Crimson
            };

            // --- C. CLOUD PALETTE (Body Color & Shadow Color) ---
            const CLOUD_KEYS = {
                NIGHT:       { main:{r:100,g:110,b:130,a:0.3}, shad:{r:50, g:60, b:80, a:0.3} },
                
                // Sunrise Clouds: Grey/Blue shadows, Bright tops
                DAWN_EARLY:  { main:{r:200,g:200,b:220,a:0.7}, shad:{r:100,g:100,b:140,a:0.6} },
                DAWN_BRIGHT: { main:{r:255,g:255,b:255,a:0.9}, shad:{r:200,g:210,b:230,a:0.5} },
                
                DAY:         { main:{r:255,g:255,b:255,a:0.95},shad:{r:220,g:230,b:240,a:0.4} },
                
                // Sunset Clouds: Gold tops, Purple/Dark shadows
                GOLDEN:      { main:{r:255,g:245,b:200,a:0.9}, shad:{r:180,g:160,b:140,a:0.5} },
                SUNSET_RED:  { main:{r:255,g:200,b:180,a:0.8}, shad:{r:80, g:40, b:60, a:0.6} }, // Pinkish top, dark purple bottom
                TWILIGHT:    { main:{r:100,g:90, b:120,a:0.5}, shad:{r:40, g:30, b:50, a:0.5} }  // Dark silhouette
            };

            // --- D. TIME INTERPOLATION ---
            let currSkyT, currSkyB, cCloudMain, cCloudShad, starOp = 0;

            // 1. NIGHT (20:30 - 04:30)
            if (m >= 1230 || m < 270) {
                currSkyT = SKY_KEYS.NIGHT.t; currSkyB = SKY_KEYS.NIGHT.b;
                cCloudMain = CLOUD_KEYS.NIGHT.main; cCloudShad = CLOUD_KEYS.NIGHT.shad;
                starOp = 1.0;
            }
            // 2. DAWN: EARLY (04:30 - 05:30) [Cool/Pale]
            else if (m < 330) {
                let p = (m - 270) / 60;
                currSkyT = lerpColor(SKY_KEYS.NIGHT.t, SKY_KEYS.DAWN_EARLY.t, p);
                currSkyB = lerpColor(SKY_KEYS.NIGHT.b, SKY_KEYS.DAWN_EARLY.b, p);
                cCloudMain = lerpColor(CLOUD_KEYS.NIGHT.main, CLOUD_KEYS.DAWN_EARLY.main, p);
                cCloudShad = lerpColor(CLOUD_KEYS.NIGHT.shad, CLOUD_KEYS.DAWN_EARLY.shad, p);
                starOp = 1.0 - p;
            }
            // 3. DAWN: BRIGHT (05:30 - 07:00) [Blue/Lemon]
            else if (m < 420) {
                let p = (m - 330) / 90;
                currSkyT = lerpColor(SKY_KEYS.DAWN_EARLY.t, SKY_KEYS.DAWN_BRIGHT.t, p);
                currSkyB = lerpColor(SKY_KEYS.DAWN_EARLY.b, SKY_KEYS.DAWN_BRIGHT.b, p);
                cCloudMain = lerpColor(CLOUD_KEYS.DAWN_EARLY.main, CLOUD_KEYS.DAWN_BRIGHT.main, p);
                cCloudShad = lerpColor(CLOUD_KEYS.DAWN_EARLY.shad, CLOUD_KEYS.DAWN_BRIGHT.shad, p);
            }
            // 4. DAY (07:00 - 16:00)
            else if (m < 960) {
                 // Slight interpolation to full day by 9:00, then hold
                 let p = Math.min(1, (m - 420) / 120);
                 currSkyT = lerpColor(SKY_KEYS.DAWN_BRIGHT.t, SKY_KEYS.DAY.t, p);
                 currSkyB = lerpColor(SKY_KEYS.DAWN_BRIGHT.b, SKY_KEYS.DAY.b, p);
                 cCloudMain = lerpColor(CLOUD_KEYS.DAWN_BRIGHT.main, CLOUD_KEYS.DAY.main, p);
                 cCloudShad = lerpColor(CLOUD_KEYS.DAWN_BRIGHT.shad, CLOUD_KEYS.DAY.shad, p);
            }
            // 5. SUNSET: GOLDEN (16:00 - 18:00) [Rich Blue/Gold]
            else if (m < 1080) {
                let p = (m - 960) / 120;
                currSkyT = lerpColor(SKY_KEYS.DAY.t, SKY_KEYS.GOLDEN.t, p);
                currSkyB = lerpColor(SKY_KEYS.DAY.b, SKY_KEYS.GOLDEN.b, p);
                cCloudMain = lerpColor(CLOUD_KEYS.DAY.main, CLOUD_KEYS.GOLDEN.main, p);
                cCloudShad = lerpColor(CLOUD_KEYS.DAY.shad, CLOUD_KEYS.GOLDEN.shad, p);
            }
            // 6. SUNSET: BURNING (18:00 - 19:15) [Violet/Red] - NO PINK
            else if (m < 1155) {
                let p = (m - 1080) / 75;
                currSkyT = lerpColor(SKY_KEYS.GOLDEN.t, SKY_KEYS.SUNSET_RED.t, p);
                currSkyB = lerpColor(SKY_KEYS.GOLDEN.b, SKY_KEYS.SUNSET_RED.b, p);
                cCloudMain = lerpColor(CLOUD_KEYS.GOLDEN.main, CLOUD_KEYS.SUNSET_RED.main, p);
                cCloudShad = lerpColor(CLOUD_KEYS.GOLDEN.shad, CLOUD_KEYS.SUNSET_RED.shad, p);
            }
            // 7. TWILIGHT (19:15 - 20:30) [Dark Navy/Dull Crimson]
            else {
                let p = (m - 1155) / 75;
                currSkyT = lerpColor(SKY_KEYS.SUNSET_RED.t, SKY_KEYS.TWILIGHT.t, p);
                currSkyB = lerpColor(SKY_KEYS.SUNSET_RED.b, SKY_KEYS.TWILIGHT.b, p);
                cCloudMain = lerpColor(CLOUD_KEYS.SUNSET_RED.main, CLOUD_KEYS.TWILIGHT.main, p);
                cCloudShad = lerpColor(CLOUD_KEYS.SUNSET_RED.shad, CLOUD_KEYS.TWILIGHT.shad, p);
                starOp = p;
                
                // Final blend to Pure Night at end
                if(p > 0.7) { 
                    let p2 = (p - 0.7) / 0.3;
                    currSkyT = lerpColor(currSkyT, SKY_KEYS.NIGHT.t, p2);
                    currSkyB = lerpColor(currSkyB, SKY_KEYS.NIGHT.b, p2);
                    cCloudMain = lerpColor(cCloudMain, CLOUD_KEYS.NIGHT.main, p2);
                    cCloudShad = lerpColor(cCloudShad, CLOUD_KEYS.NIGHT.shad, p2);
                }
            }






// --- START OF CONTEXT ---
            // --- [NEW] RAIN OVERRIDE (CLOUDY SKY) ---
            if (S.farm.weather === 'rain') {
                // 1. Force Sky to Grey/Slate
                currSkyT = {r:70, g:80, b:90, a:1};     
                currSkyB = {r:120, g:130, b:140, a:1};  

                // 2. Force Clouds to Dark Grey
                cCloudMain = {r:140, g:150, b:160, a:0.8}; 
                cCloudShad = {r:60, g:70, b:80, a:0.5};

                // 3. Hide Stars (starOp IS defined here, so this is safe)
                starOp = 0; 
                
                // [DELETE THE LINES: sunOp = 0; and moonOp = 0; FROM HERE]
            }

// --- END OF NEW CODE ---








            // DRAW SKY GRADIENT
            let grad = ctx.createLinearGradient(0, skyTopY, 0, skyBaseY);
            grad.addColorStop(0, colStr(currSkyT)); 
            grad.addColorStop(1, colStr(currSkyB));
            ctx.fillStyle = grad;
            ctx.fillRect(skyStartX, skyTopY, skyW, skyH);

            // --- E. CELESTIAL BODIES ---
            ctx.save();
            ctx.beginPath(); ctx.rect(skyStartX, skyTopY, skyW, skyH); ctx.clip();




            // [New Code]
// ...
            let sunTx = -1, sunTy = -1, sunOp = 1.0;
            let moonTx = -1, moonTy = -1, moonOp = 1.0;



// --- PASTE THIS NEW LINE HERE ---
            // [FIX] Hide bodies if raining
            if (S.farm.weather === 'rain') { sunOp = 0; moonOp = 0; }
// ------------------------------



            // Updated coordinates: Shifted +15 to match the new Cove location
            if (m >= 270 && m < 1155) { // Sun visible longer
                let p = (m - 270) / 885; 
                sunTx = lerp(257, 237, p); // <--- CHANGED (242->257, 222->237)
                sunTy = 116 - Math.sin(p * Math.PI) * 15; 
            }
            if (m >= 1155 || m < 270) { // Moon visible
                let nightM = (m >= 1155) ? (m - 1155) : (m + 285); 
                let p = nightM / 555;
                moonTx = lerp(257, 237, p); // <--- CHANGED (242->257, 222->237)
                moonTy = 116 - Math.sin(p * Math.PI) * 15;
            }

            if (sunTy > 113) sunOp = Math.max(0, 1 - (sunTy - 113) / 3);
// ...

            // --- DRAW SUN (REALISTIC FLATTENING & REDDENING) ---
            if (sunTx !== -1 && sunOp > 0) {
                let bx = (sunTx * TILE) - S.cam.x + sx;
                let by = (sunTy * TILE) - S.cam.y;
                
                // Height Ratio (0 = Zenith, 1 = Horizon)
                let hRatio = Math.max(0, Math.min(1, (sunTy - 105) / 11));
                
                // Physics: Sun gets slightly "squashed" and bigger at horizon
                let rScale = lerp(1.0, 1.4, hRatio);
                let yScale = lerp(1.0, 0.85, hRatio); // Slight refraction flattening

                // Colors: White/Yellow -> Deep Red
                let cCore = lerpColor({r:255,g:255,b:220,a:1}, {r:255,g:200,b:50,a:1}, hRatio);
                let cEdge = lerpColor({r:255,g:220,b:100,a:1}, {r:220,g:40,b:10,a:1}, hRatio); // Burning Red at end
                let cGlow = lerpColor({r:255,g:255,b:255,a:0.3}, {r:255,g:60,b:0,a:0.5}, hRatio);

                ctx.globalAlpha = sunOp;
                
                // Glow
                ctx.fillStyle = colStr(cGlow); 
                ctx.beginPath(); ctx.ellipse(bx, by, 60*rScale, 60*rScale*yScale, 0, 0, 6.28); ctx.fill();

                // Sun Body
                let gradSun = ctx.createRadialGradient(bx, by, 10*rScale, bx, by, 32*rScale);
                gradSun.addColorStop(0, colStr(cCore));
                gradSun.addColorStop(1, colStr(cEdge));
                
                ctx.fillStyle = gradSun;
                ctx.beginPath(); ctx.ellipse(bx, by, 32*rScale, 32*rScale*yScale, 0, 0, 6.28); ctx.fill();

                ctx.globalAlpha = 1.0;
            }

            // --- DRAW MOON (YOUR GEOMETRIC C-SHAPE) ---
            if (moonTx !== -1 && moonOp > 0) {
                let bx = (moonTx * TILE) - S.cam.x + sx;
                let by = (moonTy * TILE) - S.cam.y;
                ctx.globalAlpha = moonOp;

                // Restored Orion/Crux Background
                const drawSparkle = (tx, ty, s, alpha) => {
                    let f = Math.sin(Date.now()/300 + tx)*0.2 + 0.8; 
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * f})`;
                    ctx.beginPath();
                    ctx.moveTo(tx, ty - s); ctx.quadraticCurveTo(tx+1, ty-1, tx+s*0.6, ty);
                    ctx.quadraticCurveTo(tx+1, ty+1, tx, ty+s); ctx.quadraticCurveTo(tx-1, ty+1, tx-s*0.6, ty);
                    ctx.quadraticCurveTo(tx-1, ty-1, tx, ty-s); ctx.fill();
                    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tx, ty, s/4, 0, 6.28); ctx.fill();
                };
                // ORION
                drawSparkle(bx - 160, by - 20, 10, 0.9); drawSparkle(bx - 148, by - 26, 10, 0.9); drawSparkle(bx - 136, by - 32, 10, 0.9); 
                drawSparkle(bx - 175, by - 65, 14, 1.0); drawSparkle(bx - 115, by - 55, 12, 0.8); 
                drawSparkle(bx - 170, by + 25, 12, 0.8); drawSparkle(bx - 125, by + 20, 16, 1.0);
                // CRUX
                drawSparkle(bx + 140, by + 40, 16, 1.0); drawSparkle(bx + 140, by - 20, 14, 0.9); 
                drawSparkle(bx + 115, by + 10, 12, 0.9); drawSparkle(bx + 165, by + 5,  12, 0.9); drawSparkle(bx + 152, by + 22, 6,  0.7);

                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)'; ctx.lineWidth = 1; ctx.beginPath();
                ctx.moveTo(bx-175, by-65); ctx.lineTo(bx-160, by-20); ctx.moveTo(bx-115, by-55); ctx.lineTo(bx-136, by-32); 
                ctx.moveTo(bx-160, by-20); ctx.lineTo(bx-170, by+25); ctx.moveTo(bx-136, by-32); ctx.lineTo(bx-125, by+20); 
                ctx.moveTo(bx+140, by-20); ctx.lineTo(bx+140, by+40); ctx.moveTo(bx+115, by+10); ctx.lineTo(bx+165, by+5); ctx.stroke();

                // THE MOON SHAPE
                ctx.save(); ctx.translate(bx, by); ctx.rotate(-Math.PI / 4); 
                let r1=40, r2=35, d=24;
                let x = (r1*r1 - r2*r2 + d*d) / (2*d); let y = Math.sqrt(r1*r1 - x*x);
                let t1 = Math.atan2(y, x); let t2 = Math.atan2(y, x - d);
                ctx.beginPath(); ctx.arc(0, 0, r1, t1, -t1, false); ctx.arc(d, 0, r2, -t2, t2, true); ctx.closePath();
                let grad = ctx.createRadialGradient(-10, 0, 5, 0, 0, r1);
                grad.addColorStop(0.0, "#fff9c4"); grad.addColorStop(0.4, "#fbc02d"); grad.addColorStop(1.0, "#f57f17");
                ctx.fillStyle = grad; ctx.shadowColor = "#fbc02d"; ctx.shadowBlur = 25; ctx.fill();
                ctx.restore();
                ctx.globalAlpha = 1.0;
            }

            // STARS (Denser, Twinkling, Varied Sizes)
            if (starOp > 0) {
                ctx.fillStyle = '#fff';
                // INCREASED COUNT: 50 -> 200 for a starry night
                // We use a fixed seed based on 'i' so stars don't jitter around
                for(let i=0; i<200; i++) {
                    // Random positions based on sine waves to look organic but deterministic
                    let starX = skyStartX + Math.abs(Math.sin(i * 132.1)) * skyW;
                    let starY = skyTopY + Math.abs(Math.cos(i * 94.5)) * skyH;
                    
                    // Random size: Some tiny (distance), some bright
                    let size = (Math.sin(i) > 0.9) ? 1.5 : (Math.random() * 0.8 + 0.5);
                    
                    // Twinkle Speed varies per star
                    let speed = (i % 2 === 0) ? 400 : 200;
                    let twinkle = Math.sin((Date.now() / speed) + i);
                    
                    // Opacity Logic
                    let alpha = (twinkle > 0 ? 0.9 : 0.4) * starOp;
                    
                    ctx.globalAlpha = alpha;
                    ctx.beginPath(); 
                    ctx.arc(starX, starY, size, 0, 6.28); 
                    ctx.fill();
                }
                ctx.globalAlpha = 1.0;
            }
            ctx.restore();







// --- F. VOLUMETRIC CLOUDS (Unified Path Fix + Organic Shape) ---
            ctx.save(); 
            ctx.beginPath(); ctx.rect(skyStartX, skyTopY, skyW, skyH); ctx.clip(); 

            let time = Date.now() / 100; 
            
            // Cloud definitions (Positions & Seeds)
            let clouds = [
                { x: 0.1, y: 0.4, s: 1.0, spd: 0.5 }, 
                { x: 0.35, y: 0.6, s: 0.9, spd: 0.8 }, 
                { x: 0.6, y: 0.25, s: 1.4, spd: 0.4 }, 
                { x: 0.85, y: 0.5, s: 1.1, spd: 0.6 }  
            ];

            // Helper: Draws the cloud shape (without filling) into the current path
            // We use 5 overlapping circles to create a "Cumulus" shape
            const traceCloudShape = (cx, cy, s) => {
                let r = 35 * s; // Base radius scale
                
                // 1. Center Main Puff
                ctx.arc(cx, cy, r, 0, 6.28); 
                // 2. Left Base Puff
                ctx.arc(cx - r*0.85, cy + r*0.2, r*0.7, 0, 6.28);
                // 3. Right Base Puff
                ctx.arc(cx + r*0.85, cy + r*0.2, r*0.7, 0, 6.28);
                // 4. Top-Left Filler
                ctx.arc(cx - r*0.45, cy - r*0.5, r*0.55, 0, 6.28); 
                // 5. Top-Right Filler
                ctx.arc(cx + r*0.45, cy - r*0.5, r*0.55, 0, 6.28);
                // 6. Bottom Flattener (Subtle wide ellipse implication)
                ctx.arc(cx, cy + r*0.3, r*0.5, 0, 6.28);
            };




           // [NEW] RAINY SKY: HEAVY STORM (4 LAYERS + LOW MIST)
            if (S.farm.weather === 'rain') {
                
                // 1. GRADIENT BACKGROUND
                let rainGrad = ctx.createLinearGradient(0, skyTopY, 0, skyBaseY);
                rainGrad.addColorStop(0, '#263238'); // Dark Slate Top
                rainGrad.addColorStop(1, '#78909c'); // Blue Grey Horizon
                
                ctx.fillStyle = rainGrad;
                ctx.fillRect(skyStartX, skyTopY, skyW, skyH);

                let stormT = Date.now() / 150; 

                // 2. LAYERED STORM RENDERER
                const drawStratusLayer = (yOff, speed, scale, colorStr, density) => {
                    ctx.fillStyle = colorStr;
                    // Extra wide rendering to prevent gaps
                    let totalW = skyW + 800; 
                    let spacing = totalW / density;
                    
                    for (let i = 0; i < density + 3; i++) { 
                        let moveX = (stormT * speed) + (i * spacing);
                        // Shift x start position left to cover edge
                        let finalX = skyStartX + (moveX % totalW) - 400; 
                        
                        let bob = Math.sin((stormT/40) + i) * 15;
                        let finalY = skyTopY + yOff + bob;

                        ctx.save();
                        ctx.translate(finalX, finalY);
                        // SQUASH: Wide and flat (Stratus look)
                        ctx.scale(2.0, 0.8); 
                        
                        ctx.beginPath();
                        traceCloudShape(0, 0, scale);
                        ctx.fill();
                        
                        ctx.restore();
                    }
                };

                // LAYER 1: High Back (Darkest, Slow)
                drawStratusLayer(120, 0.5, 1.8, '#37474f', 4);

                // LAYER 2: Mid High (Dark Grey)
                drawStratusLayer(300, 0.8, 1.6, '#455a64', 5);

                // LAYER 3: Mid Low (Lighter Grey, covers horizon)
                drawStratusLayer(480, 1.5, 1.5, '#546e7a', 5);

                // LAYER 4: Foreground Mist (Very Low, Transparent, Fast)
                // This sits near the bottom of the skybox (yOff 600)
                drawStratusLayer(600, 3.0, 1.3, 'rgba(207, 216, 220, 0.4)', 6);

            } else {
                // === SUNNY MODE: 4 HAPPY CLOUDS ===
                clouds.forEach(c => {
                    let moveX = (c.x * skyW) + (time * c.spd); 
                    let finalX = skyStartX + (moveX % (skyW + 400)) - 200; 
                    let finalY = skyTopY + (c.y * skyH);
                    
                    // Shadow
                    ctx.beginPath();
                    traceCloudShape(finalX + 8, finalY + 8, c.s); 
                    ctx.fillStyle = (typeof cCloudShad !== 'undefined') ? `rgba(${cCloudShad.r},${cCloudShad.g},${cCloudShad.b},${cCloudShad.a})` : 'rgba(0,0,0,0.2)';
                    ctx.fill(); 

                    // Body
                    ctx.beginPath();
                    traceCloudShape(finalX, finalY, c.s);
                    ctx.fillStyle = (typeof cCloudMain !== 'undefined') ? `rgba(${cCloudMain.r},${cCloudMain.g},${cCloudMain.b},${cCloudMain.a})` : '#fff';
                    ctx.fill(); 
                });
            }

            ctx.restore();
        }


// --------------------------------







// --- [PASTE STEP 1] INSERT MASK HERE (LAYER 0.5) ---
        // This draws the blue shape FIRST, so it sits behind the tiles.
        // [NEW CODE]
// ...
// --- [PASTE STEP 1] INSERT MASK HERE (LAYER 0.5) ---
        // This draws the blue shape FIRST, so it sits behind the tiles.
        // SHIFTED RIGHT BY 15 (207 -> 222)
        let cvStartX = 222 * TILE - S.cam.x + sx; 
        let cvBaseY  = 120 * TILE - S.cam.y;      
        let cvWidth  = 51 * TILE;                 
        let endX     = cvStartX + cvWidth;        
        
        if (endX > 0 && cvStartX < cvs.width) {
// ...




            ctx.fillStyle = '#01579b'; // Deep Blue Base
            ctx.beginPath();
            ctx.moveTo(cvStartX, cvBaseY);
            let peakY = cvBaseY - (7.0 * TILE); 
            ctx.bezierCurveTo(
                cvStartX + (12 * TILE), peakY, 
                endX - (12 * TILE),     peakY, 
                endX,                   cvBaseY 
            );
            ctx.lineTo(endX, cvBaseY + 3 * TILE); 
            ctx.lineTo(cvStartX, cvBaseY + 3 * TILE);
            ctx.fill();
        }
// ----------------------------------------------------












        // --- LAYER 1: MAP TILES ---
        for(let y=cy; y<ey; y++) for(let x=cx; x<ex; x++) {
            if(x<0||y<0||x>=MAP_S||y>=MAP_S) continue;
            let t = S.map[y*MAP_S+x];
            let px = Math.floor(x*TILE-S.cam.x+sx), py = Math.floor(y*TILE-S.cam.y);





// --- DYNAMIC COVE MASK (Replaces Green Patch & Gaps) ---
            // 1. Check Range (222 to 272)
            if (x >= 222 && x <= 272 && y >= 105 && y <= 121) {
                const getBezierY = (worldX) => {
                    let relX = worldX - 222;
                    const p1x=12, p2x=39, p3x=51;
                    let t = relX / 51.0; 
                    for(let i=0; i<5; i++) { 
                        let inv = 1-t;
                        let bx = (3*inv*inv*t * p1x) + (3*inv*t*t * p2x) + (t*t*t * p3x);
                        let slope = (3*inv*inv * p1x) + (6*inv*t * (p2x-p1x)) + (3*t*t * (p3x-p2x));
                        if (Math.abs(slope) > 0.001) t -= (bx - relX) / slope;
                    }
                    let inv = 1-t;
                    let by = (3*inv*inv*t * 7.0) + (3*inv*t*t * 7.0);
                    return 120 - by; 
                };
                let curveLimitY = getBezierY(x);
                // If tile is physically inside/above curve -> Transparent
                if ((y + 1) < curveLimitY) continue; 
            }























// [NEW] TEXTURE MATH (Matches Main Game)
            let seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233));
            let r1 = (seed * 100) % 1;
            let r2 = (seed * 200) % 1;
            let r3 = (seed * 300) % 1;
            let r4 = (seed * 400) % 1;













// --- NEW: ROCKY SHORE TILES (Specific Coordinates) ---
            
            // 1. BASE SHOULDERS (Top Row Y=120)
            // Keeps the top wall line intact
            let baseShoulder = (y === 120 && ((x >= 200 && x <= 221) || (x >= 273 && x <= 294)));

            // 2. CHECK OUR CUSTOM PATCH LIST
            // This checks the specific coordinates you listed in Step 1
            let isPatch = PATCH_TILES.has(`${x},${y}`);

            // 3. COMBINE
            // If it's a top wall OR a patch tile, draw it as a rock
            let isRockyShore = baseShoulder || isPatch;







            if (isRockyShore) {
                // 1. Base Ocean Color (Deep Navy)
                ctx.fillStyle = '#01579b'; 
                ctx.fillRect(px, py, TILE+1, TILE+1);

                let rockSeed = Math.sin(x * 43758.5453 + y * 23421.6789);

                // --- LAYER A: ORIGINAL FRECKLES (Texture) ---
                let freckleCount = 4 + Math.floor(Math.abs(rockSeed) * 4); // 4-8 specks
                for(let i=0; i<freckleCount; i++) {
                    let rSeed = Math.abs(Math.sin(rockSeed + i * 99.9));
                    let rx = px + (rSeed * (TILE - 6)) + 3;
                    let ry = py + ((rSeed * 100) % (TILE - 6)) + 3;
                    let size = 1.5 + (rSeed * 2.0); // Small dots

                    if (i % 2 === 0) ctx.fillStyle = 'rgba(38, 50, 56, 0.5)'; // Dark
                    else ctx.fillStyle = 'rgba(207, 216, 220, 0.3)'; // Light
                    
                    ctx.beginPath(); ctx.arc(rx, ry, size, 0, 6.28); ctx.fill();
                }

                // --- LAYER B: MINI SEA ROCKS (3D Features) ---
                let bigCount = 1 + Math.floor(Math.abs(rockSeed) * 2); // 1-2 big rocks per tile
                for(let i=0; i<bigCount; i++) {
                    let rSeed = Math.abs(Math.sin(rockSeed + i * 12.34));
                    // Centralize slightly so they don't clip edges
                    let rx = px + 10 + (rSeed * (TILE - 20));
                    let ry = py + 10 + ((rSeed * 100) % (TILE - 20));
                    let size = 5 + (rSeed * 4); // 5px to 9px

                    // TYPE A: JAGGED SLATE
                    if (i % 2 === 0) {
                        ctx.fillStyle = '#263238'; // Dark Obsidian
                        ctx.beginPath();
                        ctx.moveTo(rx, ry - size); 
                        ctx.lineTo(rx + size/1.5, ry + size/2); 
                        ctx.lineTo(rx - size/1.5, ry + size/2); 
                        ctx.fill();
                        // Edge Highlight
                        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(rx, ry-size); ctx.lineTo(rx+size/1.5, ry+size/2); ctx.stroke();
                    } 
                    // TYPE B: SUBMERGED BOULDER
                    else {
                        ctx.fillStyle = '#546e7a'; // Blue Grey
                        ctx.beginPath();
                        ctx.ellipse(rx, ry, size, size * 0.7, rSeed, 0, 6.28);
                        ctx.fill();
                        // Shadow
                        ctx.fillStyle = 'rgba(0,0,0,0.3)';
                        ctx.beginPath(); ctx.arc(rx + 2, ry + 2, size/2, 0, 6.28); ctx.fill();
                    }
                }

                continue; // Skip standard tile rendering
            }





















// --- MASTER VOID LOGIC (Clean Version) ---
            
            // 1. LEFT SIDE (Transition Area x < 120)
            if (x < 120) {
                if (t !== 9 && t !== 10) { 
                    ctx.fillStyle = '#050505'; 
                    ctx.fillRect(px, py, TILE+1, TILE+1);
                    continue; 
                }
            }
            
            // 2. RIGHT SIDE (World End)
            if (x >= 295) {
                ctx.fillStyle = '#050505'; 
                ctx.fillRect(px, py, TILE+1, TILE+1);
                continue; 
            }



// [NEW CODE]
// ...
            // 3. TOP & BOTTOM (Sky, Mask, & Void)
            
            // A. Calculate Top Limit (Dynamic for Cove)
            // SHIFTED RIGHT +15 (208->223, 240->255)
            let topLimit = 120; 
            if (x >= 223 && x <= 255) {
                let progress = (x - 223) / 32.0;
                let curve = Math.sin(progress * Math.PI) * 4.0;
                topLimit = Math.floor(120 - curve); 
            }

           // B. Define Exclusion Zones
            
            // CHANGE THIS LINE: 275 -> 295
            // This prevents the "Void" (Black) from covering the sky
            let inSky  = (x >= 200 && x <= 295 && y >= 104 && y < 120);
            
            // SHIFTED RIGHT +15 (207->222, 258->273)
            let inMask = (x >= 222 && x <= 273 && y >= 112 && y <= 120);

            // C. Draw Void ONLY if we are NOT in Sky AND NOT in Mask
// ...            // C. Draw Void ONLY if we are NOT in Sky AND NOT in Mask
            if ((y < topLimit && !inMask && !inSky) || y >= 160) {
                ctx.fillStyle = '#050505'; 
                ctx.fillRect(px, py, TILE+1, TILE+1);
                continue; 
            }
            // -----------------------------------------














            // --------------------------------------










            // [FIX 2] DRAW BRIDGE CONNECTOR (Tile ID 10) - Matches Main Game Dirt
            if (t === 10) {
                ctx.fillStyle = '#5d4037'; // Base Dirt
                ctx.fillRect(px, py, TILE+1, TILE+1);
                
                // Gravel Texture (Matches index.html)
                ctx.fillStyle = 'rgba(0, 0, 0, 0.18)'; 
                ctx.fillRect(px + (r1 * (TILE-3)), py + (r2 * (TILE-3)), 3, 3);
                ctx.fillRect(px + (r3 * (TILE-3)), py + (r4 * (TILE-3)), 3, 3);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'; 
                ctx.fillRect(px + (r2 * (TILE-2)), py + (r3 * (TILE-2)), 2, 2);
                ctx.fillRect(px + (r4 * (TILE-2)), py + (r1 * (TILE-2)), 2, 2);
                continue;
            }



          




// =========================================================
            // === NEW: DYNAMIC TIDE & OCEAN LOGIC (Pixel Perfect) ===
            // =========================================================

           // =========================================================
            // === NEW: DYNAMIC TIDE & OCEAN LOGIC (Upgraded Visuals) ===
            // =========================================================

            // =========================================================
            // === NEW: SAILING OCEAN & DYNAMIC TIDE (High Quality) ===
            // =========================================================

          // =========================================================
            // === NEW: CALM TROPICAL OCEAN (Soothing Visuals) ===
            // =========================================================

            // =========================================================
            // === NEW: MULTI-LAYERED REALISTIC OCEAN ===
            // =========================================================

            const isBridgeZone = (x >= 145 && x <= 150 && y >= 134 && y <= 138);
            const isOceanZone = (x > 160); 

            // 1. OCEAN (Optimized: "Full-Fill" Culling + Step 10)
            if (isOceanZone && (t === T.WATER || t === 3)) { 
                
                // A. Base Sand
                ctx.fillStyle = '#fff9c4'; ctx.fillRect(px, py, TILE+1, TILE+1);
                
                // B. Tide Math
                let time = Date.now() / 2000; 
                let normY = (y - 120) / 40; 
                let curveOffset = Math.sin(normY * Math.PI) * 6;
                let baseShoreX = 188; 
                
                let worldShoreX = ((baseShoreX - curveOffset) * TILE) + (Math.sin(time) * 30);
                let dist = (x * TILE) - worldShoreX; 

                // --- OPTIMIZED SKIRT RENDERER ---
                const drawSkirt = (offsetX, color, amp, freq, spd, jaggedness) => {
                    let startScreenX = (worldShoreX + offsetX) - S.cam.x + sx;
                    
                    // OPTIMIZATION A: If wave hasn't reached this tile yet, skip
                    if (startScreenX > px + TILE + 20) return; 

                    // OPTIMIZATION B: "Full Fill"
                    // If the wave edge is way to the left of this tile, the tile is 100% covered.
                    // Just draw a rect and skip the heavy math loop!
                    if (startScreenX < px - 20) {
                         ctx.fillStyle = color; ctx.fillRect(px, py, TILE+1, TILE+1); return;
                    }

                    ctx.fillStyle = color;
                    ctx.beginPath();
                    
                    // OPTIMIZATION C: Step 10 (was 5). Huge FPS boost.
                    for (let i = 0; i <= TILE; i+=10) { 
                        let worldY = (y * TILE) + i; 
                        
                        // Base Wave
                        let wave = Math.sin((worldY / freq) + (time * spd) + (offsetX*0.05));
                        
                        // Simplified Jagged Math
                        if (jaggedness > 0) {
                            wave += Math.sin((worldY / 5) + time*5) * jaggedness;
                        }

                        let drawX = startScreenX + (wave * amp);
                        let drawY = py + i;
                        
                        if (i===0) ctx.moveTo(drawX, drawY);
                        else ctx.lineTo(drawX, drawY);
                    }
                    
                    ctx.lineTo(px + TILE + 1, py + TILE); 
                    ctx.lineTo(px + TILE + 1, py);        
                    ctx.fill();
                };

                // --- C. DRAW LAYERS (Bottom to Top) ---

                // 1. WHITE FOAM
                drawSkirt(0, '#FFFFFF', 6, 20, 2.0, 0.6);

                // 2. LIGHT BLUE
                drawSkirt(20, '#4dd0e1', 7, 30, 1.5, 0.2);

                // 3. MEDIUM BLUE
                drawSkirt(90, '#0277bd', 8, 50, 1.0, 0.0);

                // 4. DEEP NAVY
                drawSkirt(200, '#01579b', 10, 70, 0.8, 0.0);


                // --- D. BIG BELT ---
                let bigWaveCycle = (Date.now() / 5000) % 1; 
                let bigBeltOffset = 400 - (bigWaveCycle * 380); 
                let bigBeltX = (worldShoreX + bigBeltOffset) - S.cam.x + sx;
                
                // Only calc if visible on this tile
                if (bigBeltX >= px - 15 && bigBeltX <= px + TILE + 15) {
                    let alpha = (bigWaveCycle > 0.85) ? (1.0 - bigWaveCycle) * 6 : 0.6;
                    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.lineWidth = 3;
                    ctx.lineCap = 'round';
                    ctx.beginPath();
                    // Step 10 for performance
                    for (let i = 0; i <= TILE; i+=10) {
                        let worldY = (y * TILE) + i;
                        let curve = Math.sin((worldY/60) - time*4) * 8;
                        let bx = bigBeltX + curve;
                        if (i===0) ctx.moveTo(bx, py+i); else ctx.lineTo(bx, py+i);
                    }
                    ctx.stroke();
                }


                // --- E. SHORT BREAKERS ---
                let laneIndex = Math.floor(y / 5);
                let laneSeed = Math.sin(laneIndex * 999.1); 
                
                if (Math.abs(laneSeed) > 0.6) {
                    let laneSpeed = 3000 + (Math.abs(laneSeed) * 2000); 
                    let laneCycle = (Date.now() / laneSpeed + laneSeed) % 1; 
                    let shortOffset = 350 - (laneCycle * 300);
                    let shortBeltX = (worldShoreX + shortOffset) - S.cam.x + sx;

                    if (shortBeltX >= px - 15 && shortBeltX <= px + TILE + 15) {
                        let sAlpha = 0.5;
                        if (laneCycle < 0.1) sAlpha = laneCycle * 5;
                        if (laneCycle > 0.9) sAlpha = (1 - laneCycle) * 5;

                        let relY = y % 5; 
                        let taper = 1;
                        if (relY === 0 || relY === 4) taper = 0.5; 

                        ctx.strokeStyle = `rgba(255, 255, 255, ${sAlpha * taper})`;
                        ctx.lineWidth = 3 * taper; 
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        // Step 10 for performance
                        for (let i = 0; i <= TILE; i+=10) {
                            let worldY = (y * TILE) + i;
                            let curve = Math.sin((worldY/30) - time*6) * 6;
                            let bx = shortBeltX + curve;
                            if (i===0) ctx.moveTo(bx, py+i); else ctx.lineTo(bx, py+i);
                        }
                        ctx.stroke();
                    }
                }


                // --- F. MINI SKIRTS ---
                if (dist > 250) {
                    let seed = Math.sin(x * 12.9898 + y * 78.233);
                    if (seed > 0.6) {
                        let bob = Math.sin(time*2 + x) * 5;
                        let wx = px + 10 + (seed * 10);
                        let wy = py + 25 + bob;
                        // Simplified curve drawing
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(wx, wy);
                        ctx.quadraticCurveTo(wx + 10, wy + 5, wx + 20, wy);
                        ctx.stroke();
                    }
                }

                continue; 
            }







            // 2. RIVER (Standard)
            if (t === T.WATER && !isOceanZone && !isBridgeZone) {
                ctx.fillStyle = '#4fc3f7'; ctx.fillRect(px, py, TILE+1, TILE+1);
                ctx.fillStyle = '#81d4fa'; 
                if ((x*y)%3===0) ctx.fillRect(px+10, py+15, 12, 3);
                else if ((x*y)%3===1) ctx.fillRect(px+25, py+35, 8, 3);
            }
            // 3. BRIDGE WATER (Visual Only)
            else if (isBridgeZone && t === T.WATER) {
                 ctx.fillStyle = '#4fc3f7'; ctx.fillRect(px, py, TILE+1, TILE+1);
            }




















            // 4. LAND
            else {
                if (t === T.GRASS) {
                    ctx.fillStyle = '#43a047'; ctx.fillRect(px, py, TILE+1, TILE+1);
                    let seed = (x * 37) + (y * 13);
                    if (seed % 3 === 0) {
                        ctx.fillStyle = '#2e7d32'; 
                        let ox=(seed%20)+10; let oy=(seed%20)+10; ctx.fillRect(px+ox, py+oy, 2, 4); ctx.fillRect(px+ox+3, py+oy+1, 2, 3);
                    } else if (seed % 5 === 0) {
                        ctx.fillStyle = '#81c784'; let ox=(seed%30)+5; ctx.fillRect(px+ox, py+ox, 3, 3);
                    }
                } else if (t === T.BEDROCK) {
                   // 1. Check Mask
                    let isMask = (x >= 207 && x <= 258 && y >= 112 && y <= 120);
                    
                    // 2. Check Sky - CHANGE THIS LINE (275 -> 295):
                    // This tells the game: "Don't draw black bedrock here, show the sky."
                    let isSky  = (x >= 200 && x <= 295 && y >= 104 && y < 120);

                    if (isMask || isSky) {
                        continue; 
                    }
                    















                    // ------------------------------------

                    ctx.fillStyle = '#111'; ctx.fillRect(px, py, TILE, TILE);
                }







            }







            // B. GRASS DOTS (Restored!)
            if(t===T.GRASS && (x+y)%3===0) { 
                ctx.fillStyle='rgba(0,0,0,0.1)'; ctx.fillRect(px+10, py+10, 6, 6); 
            }

            // C. DYNAMIC SOIL FIELD (LIGHTER & NATURAL)
            if (isFarmable(x, y)) {
                // 1. Base Soil (Lighter, Natural Earth Brown)
                // We switched from #5d4037 (Dark) to #795548 (Standard Dirt)
                ctx.fillStyle = '#795548';
                // Draw 1px larger to fix the grid lines
                ctx.fillRect(px, py, TILE+1, TILE+1);

                // Math for random positions
                let seed = (x * 67) + (y * 23); 

                // Speck 1: Dark Clod (Shadow)
                // Slightly darker than base (#5d4037)
                ctx.fillStyle = '#5d4037';
                let x1 = Math.abs(Math.sin(seed) * TILE) % 40; 
                let y1 = Math.abs(Math.cos(seed) * TILE) % 40;
                ctx.fillRect(px + x1, py + y1, 7, 6);

                // Speck 2: Small Dark Spot
                let x2 = Math.abs(Math.sin(seed + 50) * TILE) % 40;
                let y2 = Math.abs(Math.cos(seed + 50) * TILE) % 40;
                ctx.fillRect(px + x2 + 5, py + y2 + 5, 4, 4);

                // Speck 3: Light Pebble (Dry earth)
                // Lighter than base (#a1887f)
                ctx.fillStyle = '#a1887f';
                let x3 = Math.abs(Math.sin(seed + 100) * TILE) % 40;
                let y3 = Math.abs(Math.cos(seed + 100) * TILE) % 40;
                ctx.fillRect(px + x3, py + y3, 3, 3);
            }



// [FIX 2] DRAW BRIDGE (Tile ID 10)
            // [FIX 2] DRAW BRIDGE CONNECTOR (Tile ID 10) - Matches Main Game Dirt
if (t === 10) {
    ctx.fillStyle = '#5d4037'; 
    ctx.fillRect(px, py, TILE, TILE);
    continue;
}




            // D. ROAD & BRIDGE (VINTAGE ARCH - FIXED RAILS)
            if (t === T.ROAD) {


// [INSERT 1] Restore Original Dark Water Under Bridge
                if (isBridgeZone) {
                     // Your original dark blue
                     ctx.fillStyle = '#0288d1'; 
                     ctx.fillRect(px, py, TILE+1, TILE+1);
                     
                     // Your original reflection lines
                     ctx.fillStyle = 'rgba(255,255,255,0.2)'; 
                     ctx.fillRect(px, py+10, TILE, 2); 
                     ctx.fillRect(px, py+30, TILE, 2);
                }




                if (isBridgeZone) {
                    // 1. Math for the Curve
                    let dist = Math.abs(x - 147.5); 
                    let lift = Math.max(0, Math.cos(dist * 0.6) * 20); 
                    let by = py - lift;

                    // 2. Dark Structure & Shadow (Draw this everywhere to make bridge look solid)
                    // Shadow on water
                    ctx.fillStyle = 'rgba(0,0,0,0.25)';
                    ctx.fillRect(px + 10, py + 25, TILE - 5, TILE - 10);
                    
                    // Dark supports
                    ctx.fillStyle = '#2e1c16'; 
                    ctx.fillRect(px, by + 10, TILE, (py - by) + 10);

                    // 3. BACK RAIL - Only draw on the TOP row (y=134)
                    if (y === 134) {
                        ctx.fillStyle = '#3e2723'; 
                        ctx.fillRect(px + 4, by - 15, 6, 25); // Post
                        ctx.fillRect(px + TILE - 10, by - 15, 6, 25); // Post
                        ctx.fillStyle = '#5d4037';
                        ctx.fillRect(px, by - 12, TILE, 5); // Rail
                    }

                    // 4. THE DECK - Draw planks on EVERY tile so you can walk
                    ctx.fillStyle = '#4e342e'; 
                    ctx.fillRect(px, by, TILE, TILE); 
                    
                    // Vintage Plank Pattern
                    for(let i=0; i<5; i++) {
                        ctx.fillStyle = (Math.floor(x) + i)%2 === 0 ? '#6d4c41' : '#795548';
                        ctx.fillRect(px, by + (i*10), TILE, 9); 
                        // Tiny Nails
                        ctx.fillStyle = '#1a0f0a';
                        ctx.fillRect(px + 2, by + (i*10) + 4, 2, 2);
                        ctx.fillRect(px + TILE - 4, by + (i*10) + 4, 2, 2);
                    }

                    // 5. FRONT RAIL - Only draw on the BOTTOM row (y=138)
                    if (y === 138) {
                        ctx.fillStyle = '#3e2723'; 
                        ctx.fillRect(px + 4, by + TILE - 10, 6, 25); 
                        ctx.fillRect(px + TILE - 10, by + TILE - 10, 6, 25);
                        ctx.fillStyle = '#5d4037'; 
                        ctx.fillRect(px, by + TILE - 8, TILE, 6); 
                        ctx.fillStyle = '#8d6e63'; // Highlight
                        ctx.fillRect(px, by + TILE - 8, TILE, 2); 
                    }

                } else {
                    // Normal Farm Road (Original Yellow + New Texture)
                    ctx.fillStyle = '#eeb765'; // <--- YELLOW BASE
                    ctx.fillRect(px, py, TILE+1, TILE+1);
                    
                    // Texture (Adjusted for light background)
                    // 1. Darker Brown rocks (Contrast against yellow)
                    ctx.fillStyle = 'rgba(93, 64, 55, 0.15)'; 
                    ctx.fillRect(px + (r1 * (TILE-3)), py + (r2 * (TILE-3)), 3, 3);
                    ctx.fillRect(px + (r3 * (TILE-3)), py + (r4 * (TILE-3)), 3, 3);
                    
                    // 2. White highlights (Sunlight)
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; 
                    ctx.fillRect(px + (r2 * (TILE-2)), py + (r3 * (TILE-2)), 2, 2);
                    ctx.fillRect(px + (r4 * (TILE-2)), py + (r1 * (TILE-2)), 2, 2);
                }
                
            }



           // --- E. LOGIC LAYERS ---
            let key = `${x},${y}`;
            
         // 1. PLOTS (SOIL ONLY - Plants moved to Layer 2)
            if(S.farm.plots[key]) {
                let plt = S.farm.plots[key];
                
                // Draw Soil Base
                let bgCol = plt.watered ? '#3e2723' : '#795548';
                ctx.fillStyle = bgCol; 
                ctx.fillRect(px+2, py+2, 46, 46);
                
                // Draw Soil Border
                ctx.strokeStyle = 'rgba(0,0,0,0.15)'; 
                ctx.lineWidth = 2; 
                ctx.strokeRect(px+4, py+4, 42, 42);
            }



            // 2. Fences
            if(S.farm.fences[key]) {
                ctx.fillStyle = '#8d6e63'; ctx.fillRect(px+15, py+15, 20, 20);
                ctx.fillStyle = '#6d4c41'; ctx.fillRect(px+10, py+10, 5, 30); ctx.fillRect(px+35, py+10, 5, 30);
            }





            // 3. Debris (Warm Orange-ish Brown)
            if(S.farm.debris[key]) {
                let d = S.farm.debris[key];
                let cx = px + TILE/2, cy = py + TILE/2;

                // A. WEED
                if(d==='weed') { 
                    ctx.fillStyle='rgba(0,0,0,0.2)'; 
                    ctx.beginPath(); ctx.ellipse(cx, cy+4, 6, 2, 0, 0, 6.28); ctx.fill();
                    
                    ctx.strokeStyle='#1b5e20'; ctx.lineWidth=1;
                    ctx.fillStyle='#66bb6a'; 

                    const drawLeaf = (angle, len) => {
                        ctx.save(); ctx.translate(cx, cy+4); ctx.rotate(angle);
                        ctx.beginPath(); ctx.ellipse(0, -len/2, 3, len/2, 0, 0, 6.28); 
                        ctx.fill(); ctx.stroke(); ctx.restore();
                    };
                    drawLeaf(-0.6, 12); drawLeaf(0.6, 12); drawLeaf(0, 14);
                }
                
                // B. STONE
                if(d==='stone') { 
                    ctx.fillStyle='rgba(0,0,0,0.2)'; 
                    ctx.beginPath(); ctx.ellipse(cx, cy+6, 9, 3, 0, 0, 6.28); ctx.fill();
                    
                    ctx.fillStyle='#cfd8dc'; 
                    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, 6.28); ctx.fill();
                    
                    ctx.fillStyle='#78909c'; 
                    ctx.fillRect(cx-3, cy-3, 2, 2); ctx.fillRect(cx+4, cy, 2, 2); ctx.fillRect(cx-2, cy+5, 1, 1);
                    
                    ctx.strokeStyle='#546e7a'; ctx.lineWidth=1; ctx.stroke();
                }
                
                // C. BRANCH (Fixed: Warm Amber/Orange-Brown)
                if(d==='branch') { 
                    // Shadow
                    ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=5; ctx.lineCap='round';
                    ctx.beginPath(); ctx.moveTo(cx-10, cy+12); ctx.lineTo(cx+12, cy-8); ctx.stroke();
                    
                    // Main Body (Color: #cf924c - Warm Orange-Brown)
                    ctx.strokeStyle='#d9853b'; ctx.lineWidth=4; 
                    ctx.beginPath(); ctx.moveTo(cx-12, cy+10); ctx.lineTo(cx+5, cy-5); 
                    ctx.lineTo(cx+15, cy-10); ctx.moveTo(cx+5, cy-5); ctx.lineTo(cx+8, cy-15); 
                    ctx.stroke();

                    // Detail Dot (Darker Rust)
                    ctx.fillStyle='#8c3b1a'; ctx.beginPath(); ctx.arc(cx, cy, 1.5, 0, 6.28); ctx.fill();
                }
            }





            // 4. YELLOW SELECTOR (Moved UP to draw on the floor)
            let p = S.p;
            let tx = Math.round(p.x + (p.dir===1?1:p.dir===3?-1:0));
            let ty = Math.round(p.y + (p.dir===2?1:p.dir===0?-1:0));
            if(x===tx && y===ty) {
                ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4; ctx.strokeRect(px, py, TILE, TILE);
            }








            }











// -----------------------------------------------------------

    // --- LAYER 2: ENTITIES (Sorted) ---
    // ... rest of code ...




    // --- LAYER 2: ENTITIES (Sorted) ---



/////////////////////////////
        // --- LAYER 2: ENTITIES (Sorted) ---
        // --- LAYER 2: ENTITIES (Sorted) ---
        
	// --- LAYER 2: ENTITIES (Sorted) ---
        let list = [...S.ents, {type:'p', x:S.p.x, y:S.p.y, h:1}];

// --- NEW: Add Structures to Sorting List ---
        for (let k in S.farm.structures) {
            let parts = k.split(',');
            let tx = parseInt(parts[0]);
            let ty = parseInt(parts[1]);
            // h:0.5 makes them short enough to walk "behind"
            list.push({ type: 'struct_item', kind: S.farm.structures[k], x: tx, y: ty, h: 0.5, key: k });
        }
        // -------------------------------------------





// [NEW] Add Crops (So they sort with Player & cover Yellow Box)
        for (let k in S.farm.plots) {
            let plt = S.farm.plots[k];
            // Only add if there is actually a plant (Stage > 0)
            if (plt.stage > 0) {
                let parts = k.split(',');
                list.push({ 
                    type: 'crop', 
                    kind: plt.crop || 'carrot', 
                    stage: plt.stage, 
                    x: parseInt(parts[0]), 
                    y: parseInt(parts[1]), 
                    h: 0.5 // Sorts nicely with player feet
                });
            }
        }







        
        // 1. Check if Player is Inside FIRST
        let house = S.ents.find(e => e.kind === 'FarmHouse');
        let isInside = house && xIn(house, S.p.x, S.p.y);

        // 2. Sort objects by Y position (Depth)
        list.sort((a,b) => {
            let getDepth = (e) => {
                // [FIX] HOUSE DEPTH LOGIC
                if (e.kind === 'FarmHouse') {
                    // If Inside: Draw House first (Background)
                    // If Outside: Draw House normally (based on its bottom edge)
                    return isInside ? -10000 : (e.y + e.h); 
                }
                

		// [FIX] CAMPFIRE DEPTH
                // Treat the fire as only 1 tile high for sorting, so player can stand 
                // on the bottom half (side) and still appear "in front" of it.
                if (e.kind === 'campfire') return e.y + 1.0;


                // Bed (Draw behind player if they stand on it)
                if (e.kind === 'Bed') return e.y + 0.1; 
                
                // Player (Offset slightly to center feet)
                if (e.type === 'p') return e.y + 0.5;
                
                // Everything else (Sort by bottom edge)
                return e.y + (e.h || 1);
            };

            return getDepth(a) - getDepth(b);
        });





        list.forEach(e => {
            let x = Math.floor(e.x*TILE - S.cam.x + sx);
            let y = Math.floor(e.y*TILE - S.cam.y);
            let w = (e.w||1)*TILE, h = (e.h||1)*TILE;
            



////







/////////////////////



                








// 1. PLAYER (Logic Block)
           // 1. PLAYER (Logic Block)
            if(e.type === 'p') {
                



// --- FIX: PREVENT DOUBLE DRAW IN COVE ---
                // If we are in the Redraw Region (Cove/Sky) AND it is Night/Sunset,
                // skip this standard draw. Layer 4.5 will handle it on top of the darkness.
                let t = S.farm.time;
                // Tint active from 15:00 (900) to 06:00 (360)
                let isTinted = (t >= 900 || t < 360); 
                let inRedrawZone = (S.p.x >= 195 && S.p.x <= 295 && S.p.y <= 122);

                if (isTinted && inRedrawZone) return;
                // ----------------------------------------





                // [NEW LINE] Add this flag variable
                let heroDrawn = false; 

// Z. DRAW BOAT UNDER PLAYER
                // Z. DRAW BOAT UNDER PLAYER (STEEPER ANGLES + FIXED HANDLES)
                if (S.p.isBoating) {
                    ctx.save();

                    // [NEW BLOCK] Paste this Helper Function here
                    const injectHero = () => {
                        ctx.save(); 
                        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset Transform
                        drawHero(x, y); 
                        heroDrawn = true; // Mark as done
                        ctx.restore(); // Restore Boat Transform
                    }; 
                    // ---------------------------------------------
                    
                    
                    
                    // 1. POSITIONING
                    ctx.translate(x + 25, y + 45); 
                    ctx.scale(1.6, 1.6); 

                    // 2. ANIMATION
                    let time = Date.now();
                    let dir = S.p.dir;
                    
                    let bob = Math.sin(time / 450) * 1.5; 
                    let roll = Math.sin(time / 700) * 0.04; 
                    
                    let isMoving = (S.input.keys['arrowup'] || S.input.keys['arrowdown'] || 
                                    S.input.keys['arrowleft'] || S.input.keys['arrowright']);
                    
                    let rowCycle = isMoving ? (time / 220) : 1.5; 
                    let oarSwing = Math.sin(rowCycle) * 0.6; // Forward/Back
                    let oarLift = Math.cos(rowCycle); // Up/Down
                    
                    // 3. PALETTE
                    const C_HULL_BASE  = '#5d4037'; 
                    const C_HULL_DARK  = '#3e2723'; 
                    const C_HULL_TRIM  = '#8d6e63'; 
                    const C_INT_DARK   = '#281a17'; 
                    const C_RIBS       = '#4e342e'; 
                    const C_OAR_SHAFT  = '#d7ccc8'; 
                    const C_OAR_BLADE  = '#a1887f'; 
                    const C_BRASS      = '#ffb74d'; 
                    
                    const WATER_LEVEL = 10; 

                    // Wake
                    ctx.save();
                    ctx.scale(1, 0.3);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.beginPath(); ctx.arc(0, 40, 40 + Math.sin(time/300)*3, 0, 6.28); ctx.fill();
                    ctx.restore();

                    ctx.rotate(roll);
                    ctx.translate(0, bob);

                    // --- HELPER: Draw Blade ---
                    const drawBlade = (ctxRef, isSubmerged) => {
                        ctxRef.beginPath();
                        ctxRef.moveTo(-2, 0);   
                        ctxRef.lineTo(-4, 14);  
                        ctxRef.lineTo(4, 14);   
                        ctxRef.lineTo(2, 0);    
                        ctxRef.closePath();
                        
                        if (isSubmerged) {
                            ctxRef.fillStyle = 'rgba(62, 39, 35, 0.5)'; 
                            ctxRef.fill();
                            ctxRef.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                            ctxRef.lineWidth = 1;
                            ctxRef.beginPath(); ctxRef.moveTo(-6, 2); ctxRef.lineTo(6, 2); ctxRef.stroke();
                        } else {
                            ctxRef.fillStyle = C_OAR_BLADE;
                            ctxRef.fill();
                            ctxRef.fillStyle = 'rgba(0,0,0,0.1)';
                            ctxRef.fillRect(-0.5, 0, 1, 14);
                        }
                    };

                    // ==========================================
                    // === SIDE VIEW (Left/Right) ===
                    // ==========================================
                    // === SIDE VIEW (Left/Right) - 3 SEGMENT OARS ===
                    // ==========================================
                    // ==========================================
                    // === SIDE VIEW (Left/Right) - FIXED VISIBILITY ===
                    // ==========================================
                    if (dir === 1 || dir === 3) { 
                        let flip = (dir===3) ? -1 : 1;
                        ctx.scale(flip, 1);

                        const drawSideOar = (isFar) => {
                            // 1. ANIMATION & ANGLE
                            let rowCycle = isMoving ? (time / 220) : 0;
                            let baseAngle = 0.55; 
                            let swing = isMoving ? Math.sin(rowCycle) * 0.5 : 0;
                            let angle = baseAngle + swing;
                            if (!isFar) angle += 0.1; 

                            let dx = Math.cos(angle);
                            let dy = Math.sin(angle);

                            let px = -4; 
                            let py = -6;
                            
                            // Water Line (Y-coord relative to pivot/boat center where water starts)
                            let waterLine = 5;

                           // 2. SEGMENT 1: HANDLE (Dark Wood)
                            // Updated to 12 to match Front View proportions
                            let handleLen = 12;
                            ctx.strokeStyle = '#3e2723'; 
                            ctx.lineWidth = 2;
                            ctx.lineCap = 'round';
                            ctx.beginPath();
                            ctx.moveTo(px, py); 
                            ctx.lineTo(px - (dx * handleLen), py - (dy * handleLen)); 
                            ctx.stroke();


                            // 3. SEGMENT 2: SHAFT (Light Wood)
                            let stickLen = 36;
                            let tipX = px + (dx * stickLen);
                            let tipY = py + (dy * stickLen);
                            
                            // --- VISIBILITY FIX ---
                            // If this is the FAR oar and it goes underwater, clip the shaft.
                            let drawTipX = tipX;
                            let drawTipY = tipY;
                            let isSubmerged = (tipY > waterLine);

                            if (isFar && isSubmerged) {
                                // Calculate where the stick hits the water line
                                // t = (waterLine - startY) / (endY - startY)
                                let t = (waterLine - py) / (tipY - py);
                                drawTipX = px + (dx * stickLen * t);
                                drawTipY = waterLine;
                            }

                            ctx.strokeStyle = C_OAR_SHAFT; 
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.moveTo(px, py);
                            ctx.lineTo(drawTipX, drawTipY);
                            ctx.stroke();

                            // 4. SEGMENT 3: BLADE
                            // If Far Oar is submerged, we DO NOT draw the blade (it's hidden behind hull/water)
                            if (isFar && isSubmerged) return;

                            ctx.save();
                            ctx.translate(tipX, tipY);
                            ctx.rotate(angle - Math.PI/2); 
                            
                            let bLen = 16; 

                            if (isSubmerged) {
                                // Submerged Style (Only visible for Near Oar now)
                                ctx.beginPath();
                                ctx.moveTo(-2, 0); ctx.lineTo(-4, bLen); ctx.lineTo(4, bLen); ctx.lineTo(2, 0); 
                                ctx.fillStyle = 'rgba(62, 39, 35, 0.5)'; 
                                ctx.fill();
                                
                                // Ripple
                                ctx.save();
                                ctx.rotate(-(angle - Math.PI/2)); 
                                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                                ctx.lineWidth = 1;
                                ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke();
                                ctx.restore();

                            } else {
                                // Air Style
                                ctx.beginPath();
                                ctx.moveTo(-2, 0); ctx.lineTo(-4, bLen); ctx.lineTo(4, bLen); ctx.lineTo(2, 0); ctx.closePath();
                                ctx.fillStyle = C_OAR_BLADE; ctx.fill();
                                ctx.fillStyle = 'rgba(0,0,0,0.1)'; ctx.fillRect(-0.5, 0, 1, bLen);
                            }

                            ctx.restore();
                        };

                        // A. DRAW FAR OAR
                        drawSideOar(true);

                        // B. DRAW BOAT HULL
                        
                        // [LAYER 1: BACK WALL]
                        ctx.fillStyle = C_INT_DARK;
                        ctx.beginPath();
                        ctx.moveTo(-30, -5); ctx.quadraticCurveTo(0, 6, 36, -12);
                        ctx.lineTo(36, -4); ctx.quadraticCurveTo(0, 14, -30, 0); ctx.fill();

                        // [LAYER 2: PLAYER]
                        injectHero();

                        // [LAYER 3: FRONT HULL]
                        ctx.fillStyle = C_HULL_BASE;
                        ctx.beginPath();
                        ctx.moveTo(-32, -4); ctx.quadraticCurveTo(0, 14, 38, -12);
                        ctx.lineTo(32, 8); ctx.quadraticCurveTo(0, 20, -28, 8); ctx.fill();

                        ctx.strokeStyle = C_HULL_DARK; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(-31, 0); ctx.quadraticCurveTo(0, 16, 36, -8); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(-29, 5); ctx.quadraticCurveTo(0, 18, 34, 0); ctx.stroke();

                        ctx.strokeStyle = C_HULL_TRIM; ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.moveTo(-32, -4); ctx.quadraticCurveTo(0, 14, 38, -12); ctx.stroke();
                        
                        ctx.fillStyle = C_BRASS; ctx.fillRect(-7, -2, 4, 3);

                        // C. DRAW NEAR OAR
                        drawSideOar(false);
                    }
                    // ==========================================
                    // === VERTICAL VIEW (Corrected Angles) ===
                    // ==========================================
                    else { 
                        const drawVertOar = (side) => { 
                            ctx.save();
                            // Pivot at Oarlock
                            ctx.translate(side * 19, -9);

                            // --- ANGLE FIX ---
                            // 0.7 radians (approx 40 degrees) makes them point nicely "down/out"
                            // instead of 0.3 (approx 17 degrees) which was too flat.
                            let baseAngle = 0.7; 
                            let angle = (side === -1) 
                                ? (Math.PI - baseAngle + oarSwing*0.3) 
                                : (baseAngle - oarSwing*0.3);
                            
                            let len = (isMoving && oarLift < -0.2) ? 20 : 26; 
                            
                            let tipX = Math.cos(angle) * len;
                            let tipY = Math.sin(angle) * len; // Removed abs(), trust the angle math

                            // 1. HANDLE (Dark Wood) - INCREASED LENGTH
                            // We increase this to 15 so it looks like it goes through the hand
                            let handleVisualLen = 15; 
                            
                            ctx.strokeStyle = '#3e2723'; 
                            ctx.lineWidth = 2;
                            ctx.beginPath(); 
                            ctx.moveTo(0,0); 
                            // Draw handle opposite to the shaft direction
                            ctx.lineTo(-Math.cos(angle)*handleVisualLen, -Math.sin(angle)*handleVisualLen); 
                            ctx.stroke();

                            // 2. SHAFT
                            ctx.strokeStyle = C_OAR_SHAFT; 
                            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(tipX, tipY); ctx.stroke();
                            
                            // 3. BLADE
                            ctx.translate(tipX, tipY);
                            ctx.rotate(angle - Math.PI/2); 

                            let depth = -9 + tipY; 

                            if (depth + 14 > WATER_LEVEL) {
                                ctx.save();
                                ctx.beginPath(); ctx.rect(-10, WATER_LEVEL - depth, 20, 20); ctx.clip();
                                drawBlade(ctx, true);
                                ctx.restore();
                            }
                            if (depth < WATER_LEVEL) {
                                ctx.save();
                                ctx.beginPath(); ctx.rect(-10, -20, 20, WATER_LEVEL - depth); ctx.clip();
                                drawBlade(ctx, false);
                                ctx.restore();
                            }
                            ctx.restore();
                        };

                        drawVertOar(-1);
                        drawVertOar(1);







                       // --- BOAT BODY (Compressed) ---
                        // --- BOAT BODY (Compressed) ---
                        ctx.save();
                        ctx.scale(1, 0.75);

                        if (dir === 2) { // FRONT VIEW (Facing Camera)
                            // 1. BOTTOM: Interior
                            ctx.fillStyle = C_INT_DARK;
                            ctx.beginPath(); ctx.ellipse(0, -6, 18, 7, 0, 0, 6.28); ctx.fill();
                            ctx.strokeStyle = C_RIBS; ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, 1); ctx.stroke();
                            ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-7, 0); ctx.stroke();
                            ctx.beginPath(); ctx.moveTo(9, -10); ctx.lineTo(7, 0); ctx.stroke();

                            // 2. MIDDLE: Player
                            injectHero(); 

                            // 3. TOP: Front Rim (Covers Legs)
                            ctx.fillStyle = C_HULL_TRIM; ctx.fillRect(-12, -8, 24, 3); ctx.fillRect(-11, -3, 22, 3); 
                            ctx.fillStyle = C_HULL_BASE; ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(0, 30, 20, -6); ctx.fill();
                            ctx.strokeStyle = C_HULL_DARK; ctx.lineWidth = 1;
                            ctx.beginPath(); ctx.moveTo(-17, 4); ctx.quadraticCurveTo(0, 22, 17, 4); ctx.stroke();
                            ctx.beginPath(); ctx.moveTo(-15, 12); ctx.quadraticCurveTo(0, 24, 15, 12); ctx.stroke();
                            ctx.strokeStyle = C_HULL_TRIM; ctx.lineWidth = 3;
                            ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(0, 6, 20, -6); ctx.stroke();
                            ctx.fillStyle = C_HULL_TRIM; ctx.beginPath(); ctx.moveTo(-2, 22); ctx.lineTo(2, 22); ctx.lineTo(0, 26); ctx.fill();

                        } else { // Back View (Combined: Sturdy + Horizontal Bar)
                            
                            // 1. BOTTOM LAYER: Hull & Seat
                            // Main body
                            ctx.fillStyle = C_HULL_BASE;
                            ctx.beginPath(); ctx.moveTo(-19, -10); ctx.quadraticCurveTo(0, 24, 19, -10); ctx.fill();
                            
                            // The Seat (Darker - Player sits on this)
                            ctx.fillStyle = C_HULL_DARK; 
                            ctx.fillRect(-15, -12, 30, 6); 

                            // 2. MIDDLE LAYER: Player
                            injectHero();

                            // 3. TOP LAYER: The Transom (Back Wall)
                            
                            // A. Hull Mask (Covers legs)
                            // Curves down from the bar to the water
                            ctx.fillStyle = C_HULL_BASE;
                            ctx.beginPath(); 
                            ctx.moveTo(-18, -6); 
                            ctx.quadraticCurveTo(0, 22, 18, -6); 
                            ctx.fill();

                            // B. The Horizontal Bar (The distinct beam)
                            let barY = -10;
                            
                            // Main Beam
                            ctx.fillStyle = C_HULL_TRIM; 
                            ctx.fillRect(-20, barY, 40, 6); 

                            // Brass Nails on the ends
                            ctx.fillStyle = C_BRASS;
                            ctx.fillRect(-18, barY + 2, 2, 2);
                            ctx.fillRect(16, barY + 2, 2, 2);

                            // Shadow under the bar (Depth)
                            ctx.fillStyle = 'rgba(0,0,0,0.3)';
                            ctx.fillRect(-18, barY + 6, 36, 2);

                            // C. Sturdy Outer Rim
                            // Connects the horizontal bar to the curved hull
                            ctx.strokeStyle = C_HULL_TRIM; 
                            ctx.lineWidth = 3; 
                            ctx.beginPath(); 
                            ctx.moveTo(-20, barY + 3); 
                            ctx.quadraticCurveTo(0, 25, 20, barY + 3); 
                            ctx.stroke();
                        }
                        
                        ctx.restore();






                        ctx.fillStyle = C_BRASS;
                        let lockY = (dir===2) ? -8 : -10;
                        ctx.fillRect(-20, lockY, 3, 4);
                        ctx.fillRect(17, lockY, 3, 4);
                    }
                    
                    ctx.restore();
                }
















                // A. DRAW HORSE FIRST
                if (S.p.isRiding) {


                    let dir = S.p.dir;
                    let faceScale = (dir === 3) ? -1 : 1;
                    let isMoving = (S.input.keys['arrowup']||S.input.keys['arrowdown']||S.input.keys['arrowleft']||S.input.keys['arrowright']);
                    let rRunBob = isMoving ? Math.sin(Date.now()/60)*4 : 0;
                    
                    let cx = x + 25; 
                    let rFeetY = y + 42;   
                    let rBodyY = rFeetY - 26; 

                    const C_COAT='#A1887F', C_SHADE='#5D4037', C_MANE='#212121', C_NOSE='#3E2723', C_HOOF='#1A1A1A';
                    const drawHoof = (hx, hy, w) => { ctx.fillStyle = C_HOOF; ctx.beginPath(); ctx.moveTo(hx-w/2, hy); ctx.lineTo(hx+w/2, hy); ctx.lineTo(hx+w/2+2, hy+5); ctx.lineTo(hx-w/2-2, hy+5); ctx.fill(); };

                    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(cx, rFeetY, 24, 8, 0, 0, 6.28); ctx.fill();

                    if (dir === 1 || dir === 3) { // SIDE
                        let legSwing = isMoving ? Math.sin(Date.now()/50)*10 : 0;
                        ctx.fillStyle = C_SHADE;
                        ctx.beginPath(); ctx.moveTo(cx-(16*faceScale)+legSwing, rBodyY); ctx.lineTo(cx-(18*faceScale)+legSwing, rFeetY); ctx.lineTo(cx-(10*faceScale)+legSwing, rFeetY); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx+(16*faceScale)-legSwing, rBodyY); ctx.lineTo(cx+(18*faceScale)-legSwing, rFeetY); ctx.lineTo(cx+(10*faceScale)-legSwing, rFeetY); ctx.fill();
                        ctx.fillStyle = C_MANE; ctx.beginPath(); ctx.moveTo(cx-(24*faceScale), rBodyY-10); ctx.quadraticCurveTo(cx-(38*faceScale), rBodyY+5, cx-(28*faceScale), rBodyY+20); ctx.lineTo(cx-(24*faceScale), rBodyY+5); ctx.fill();
                        ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.ellipse(cx, rBodyY + rRunBob, 28, 16, 0, 0, 6.28); ctx.fill();
                        
                        let neckX = cx + (15*faceScale), neckY = rBodyY+rRunBob-5, headX = cx+(32*faceScale), headY = rBodyY+rRunBob-32;
                        ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.moveTo(neckX-(5*faceScale), neckY+10); ctx.lineTo(headX-(4*faceScale), headY+10); ctx.lineTo(headX-(8*faceScale), headY-6); ctx.lineTo(neckX-(15*faceScale), neckY-10); ctx.fill();
                        ctx.fillStyle = C_MANE; ctx.beginPath(); ctx.moveTo(neckX-(15*faceScale), neckY-10); ctx.lineTo(headX-(8*faceScale), headY-6); ctx.lineTo(headX-(14*faceScale), headY+5); ctx.fill();
                        ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.arc(headX, headY, 9, 0, 6.28); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(headX-(2*faceScale), headY-5); ctx.lineTo(headX+(10*faceScale), headY+2); ctx.lineTo(headX+(8*faceScale), headY+8); ctx.lineTo(headX-(2*faceScale), headY+5); ctx.fill();
                        ctx.fillStyle = C_NOSE; ctx.beginPath(); ctx.ellipse(headX+(10*faceScale), headY+5, 5, 4, 0, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(headX-(1*faceScale), headY-11); ctx.lineTo(headX+(9*faceScale), headY-5); ctx.lineTo(headX+(9*faceScale), headY+0); ctx.lineTo(headX-(1*faceScale), headY-6); ctx.fill();
                        ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.moveTo(headX-(2*faceScale), headY-8); ctx.lineTo(headX-(4*faceScale), headY-16); ctx.lineTo(headX+(2*faceScale), headY-8); ctx.fill();
                        ctx.fillStyle = '#000'; ctx.fillRect(headX, headY-5, 3, 3);
                        
                        ctx.fillStyle = C_COAT;
                        ctx.beginPath(); ctx.moveTo(cx-(16*faceScale)-legSwing, rBodyY); ctx.lineTo(cx-(18*faceScale)-legSwing, rFeetY-2); ctx.lineTo(cx-(10*faceScale)-legSwing, rFeetY-2); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx+(16*faceScale)+legSwing, rBodyY); ctx.lineTo(cx+(18*faceScale)+legSwing, rFeetY-2); ctx.lineTo(cx+(10*faceScale)+legSwing, rFeetY-2); ctx.fill();
                        drawHoof(cx-(14*faceScale)-legSwing, rFeetY-4, 8); drawHoof(cx+(14*faceScale)+legSwing, rFeetY-4, 8);
                        ctx.fillStyle = '#5d4037'; ctx.fillRect(cx-(8*faceScale), rBodyY+rRunBob-16, 16, 6);
                    } 
                    else { // FRONT/BACK
                        ctx.fillStyle = (dir===2)?C_SHADE:C_COAT; ctx.fillRect(cx-16, rFeetY-18, 8, 18); ctx.fillRect(cx+8, rFeetY-18, 8, 18);
                        ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.ellipse(cx, rBodyY+rRunBob, 20, 18, 0, 0, 6.28); ctx.fill();
                        if (dir === 2) { 
                             ctx.fillStyle = C_COAT; ctx.fillRect(cx-20, rFeetY-22, 9, 22); ctx.fillRect(cx+11, rFeetY-22, 9, 22);
                             drawHoof(cx-16, rFeetY-5, 9); drawHoof(cx+15, rFeetY-5, 9);
                        } else { 
                             drawHoof(cx-12, rFeetY-5, 8); drawHoof(cx+12, rFeetY-5, 8);
                             let tailWag = Math.sin(Date.now()/100)*3;
                             ctx.fillStyle = C_MANE; ctx.fillRect(cx-3+tailWag, rBodyY+rRunBob-5, 6, 24);
                        }
                    }
                }

                // B. CALL PAINTER
                // If we already drew the hero inside the boat (sandwiched), skip this.
                // Otherwise (walking/riding), draw normally.
                // Only draw hero if they weren't already drawn inside the boat sandwich
                if (!heroDrawn) drawHero(x, y);
                

                // C. HORSE OVERLAY
                if (S.p.isRiding && S.p.dir === 2) {
                    let cx = x + 25; 
                    let rFeetY = y + 42; let rBodyY = rFeetY - 26;
                    let isMoving = (S.input.keys['arrowup']||S.input.keys['arrowdown']||S.input.keys['arrowleft']||S.input.keys['arrowright']);
                    let rRunBob = isMoving ? Math.sin(Date.now()/60)*4 : 0;
                    let headY = rBodyY + rRunBob - 2; 
                    
                    const C_COAT='#A1887F', C_NOSE='#3E2723', C_MANE='#212121';

                    ctx.fillStyle = C_COAT;
                    ctx.beginPath(); ctx.ellipse(cx, headY + 10, 12, 12, 0, 0, 6.28); ctx.fill(); 
                    ctx.beginPath(); ctx.ellipse(cx, headY, 11, 15, 0, 0, 6.28); ctx.fill(); 
                    ctx.fillStyle = C_NOSE; ctx.beginPath(); ctx.ellipse(cx, headY + 10, 9, 6, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 2, headY - 10, 4, 14);
                    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(cx - 6, headY - 4, 2, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 6, headY - 4, 2, 0, 6.28); ctx.fill();
                    ctx.fillStyle = C_COAT;
                    ctx.beginPath(); ctx.moveTo(cx-5, headY-12); ctx.lineTo(cx-10, headY-22); ctx.lineTo(cx-2, headY-12); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(cx+5, headY-12); ctx.lineTo(cx+10, headY-22); ctx.lineTo(cx+2, headY-12); ctx.fill();
                    ctx.fillStyle = C_MANE; ctx.beginPath(); ctx.arc(cx, headY-12, 4, 0, 6.28); ctx.fill();
                }
            }








            // 4. WILD HORSE (ANIMATED WALKING + COLOR FIX)
            else if(e.type === 'horse') {
                let cx = x + w/2; 
                let feetY = y + h - 5; 
                let bodyY = feetY - 26; 

                // ANIMATION LOGIC FOR WILD HORSE
                let isWalking = (e.walkTimer > 0);
                let bob = isWalking ? Math.sin(Date.now()/60)*4 : (Math.sin(Date.now()/200)*2);
                let legSwing = isWalking ? Math.sin(Date.now()/50)*10 : 0;
                
                let dir = (typeof e.dir !== 'undefined') ? e.dir : 2; 
                let faceScale = (dir === 3) ? -1 : 1; 

                const C_COAT  = '#A1887F'; // Color Update
                const C_SHADE = '#5D4037'; 
                const C_MANE  = '#212121';
                const C_NOSE  = '#3E2723';
                const C_HOOF  = '#1A1A1A';

                const drawHoof = (hx, hy, w) => {
                    ctx.fillStyle = C_HOOF;
                    ctx.beginPath();
                    ctx.moveTo(hx - w/2, hy); 
                    ctx.lineTo(hx + w/2, hy); 
                    ctx.lineTo(hx + w/2 + 2, hy + 5); 
                    ctx.lineTo(hx - w/2 - 2, hy + 5); 
                    ctx.fill();
                };

                ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
                ctx.beginPath(); ctx.ellipse(cx, feetY, 24, 8, 0, 0, 6.28); ctx.fill();

                // === A. SIDE VIEW ===
                if (dir === 1 || dir === 3) {
                    ctx.fillStyle = C_SHADE;
                    // Far Legs with Swing
                    ctx.beginPath(); ctx.moveTo(cx-(20*faceScale)+legSwing, bodyY); 
                    ctx.lineTo(cx-(22*faceScale)+legSwing, feetY-2); ctx.lineTo(cx-(16*faceScale)+legSwing, feetY-2); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(cx+(12*faceScale)-legSwing, bodyY); 
                    ctx.lineTo(cx+(14*faceScale)-legSwing, feetY-2); ctx.lineTo(cx+(8*faceScale)-legSwing, feetY-2); ctx.fill();

                    ctx.fillStyle = C_MANE;
                    ctx.beginPath(); ctx.moveTo(cx-(24*faceScale), bodyY-10);
                    ctx.quadraticCurveTo(cx-(38*faceScale), bodyY+5, cx-(28*faceScale), bodyY+20);
                    ctx.lineTo(cx-(24*faceScale), bodyY+5); ctx.fill();

                    ctx.fillStyle = C_COAT;
                    ctx.beginPath(); ctx.ellipse(cx, bodyY + bob, 28, 16, 0, 0, 6.28); ctx.fill();

                    let neckX = cx + (15 * faceScale);
                    let neckY = bodyY - 5 + bob;
                    let headX = cx + (32 * faceScale);
                    let headY = bodyY - 32 + bob;

                    ctx.fillStyle = C_COAT; 
                    ctx.beginPath();
                    ctx.moveTo(neckX - (5*faceScale), neckY + 10);
                    ctx.lineTo(headX - (4*faceScale), headY + 10);
                    ctx.lineTo(headX - (8*faceScale), headY - 6);
                    ctx.lineTo(neckX - (15*faceScale), neckY - 10); ctx.fill();

                    ctx.fillStyle = C_MANE;
                    ctx.beginPath(); ctx.moveTo(neckX - (15*faceScale), neckY - 10);
                    ctx.lineTo(headX - (8*faceScale), headY - 6); ctx.lineTo(headX - (14*faceScale), headY + 5); ctx.fill();

                    // Skull
                    ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.arc(headX, headY, 9, 0, 6.28); ctx.fill();
                    
                    // Nose Bridge
                    ctx.beginPath(); 
                    ctx.moveTo(headX - (2*faceScale), headY - 5);
                    ctx.lineTo(headX + (10*faceScale), headY + 2); 
                    ctx.lineTo(headX + (8*faceScale), headY + 8);  
                    ctx.lineTo(headX - (2*faceScale), headY + 5);
                    ctx.fill();

                    // Muzzle
                    ctx.fillStyle = C_NOSE; ctx.beginPath(); ctx.ellipse(headX + (10*faceScale), headY + 5, 5, 4, 0, 0, 6.28); ctx.fill();
                    
                    // Blaze
                    ctx.fillStyle = '#fff';
                    ctx.beginPath(); 
                    ctx.moveTo(headX - (1*faceScale), headY - 11); 
                    ctx.lineTo(headX + (9*faceScale), headY - 5); 
                    ctx.lineTo(headX + (9*faceScale), headY + 0); 
                    ctx.lineTo(headX - (1*faceScale), headY - 6); 
                    ctx.fill();

                    // Ears & Eye
                    ctx.fillStyle = C_COAT; 
                    ctx.beginPath(); ctx.moveTo(headX-(2*faceScale), headY-8); ctx.lineTo(headX-(4*faceScale), headY-16); ctx.lineTo(headX+(2*faceScale), headY-8); ctx.fill();
                    
                    ctx.fillStyle = '#000'; ctx.fillRect(headX, headY - 5, 3, 3); // Bigger Eye

                    // Near Legs
                    ctx.fillStyle = C_COAT;
                    ctx.beginPath(); ctx.moveTo(cx-(18*faceScale)-legSwing, bodyY); 
                    ctx.lineTo(cx-(20*faceScale)-legSwing, feetY-2); ctx.lineTo(cx-(14*faceScale)-legSwing, feetY-2); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(cx+(14*faceScale)+legSwing, bodyY); 
                    ctx.lineTo(cx+(16*faceScale)+legSwing, feetY-2); ctx.lineTo(cx+(10*faceScale)+legSwing, feetY-2); ctx.fill();
                    
                    // HOOVES
                    drawHoof(cx-(16*faceScale)-legSwing, feetY-4, 9);
                    drawHoof(cx+(14*faceScale)+legSwing, feetY-4, 9);
                }

                // === B. FRONT VIEW ===
                else if (dir === 2) {
                    ctx.fillStyle = C_SHADE; ctx.fillRect(cx - 12, feetY - 16, 8, 16); ctx.fillRect(cx + 4, feetY - 16, 8, 16);
                    
                    ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.ellipse(cx, bodyY + bob, 18, 18, 0, 0, 6.28); ctx.fill();
                    
                    ctx.fillStyle = C_COAT; ctx.fillRect(cx - 20, feetY - 22, 9, 22); ctx.fillRect(cx + 11, feetY - 22, 9, 22);
                    
                    // HOOVES
                    drawHoof(cx - 16, feetY - 5, 9);
                    drawHoof(cx + 15, feetY - 5, 9);

                    let hy = bodyY - 18 + bob;
                    ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.ellipse(cx, hy, 11, 15, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = C_NOSE; ctx.beginPath(); ctx.ellipse(cx, hy + 10, 9, 6, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 2, hy - 10, 4, 14);
                    
                    ctx.fillStyle = '#000'; 
                    ctx.beginPath(); ctx.arc(cx - 6, hy - 4, 2, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx + 6, hy - 4, 2, 0, 6.28); ctx.fill();

                    ctx.fillStyle = C_COAT;
                    ctx.beginPath(); ctx.moveTo(cx-5, hy-12); ctx.lineTo(cx-10, hy-22); ctx.lineTo(cx-2, hy-12); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(cx+5, hy-12); ctx.lineTo(cx+10, hy-22); ctx.lineTo(cx+2, hy-12); ctx.fill();
                }

                // === C. BACK VIEW ===
                else {
                    ctx.fillStyle = C_COAT; ctx.fillRect(cx - 16, feetY - 22, 9, 22); ctx.fillRect(cx + 7, feetY - 22, 9, 22);
                    
                    // HOOVES
                    drawHoof(cx - 12, feetY - 5, 9);
                    drawHoof(cx + 11, feetY - 5, 9);

                    ctx.fillStyle = C_COAT; ctx.beginPath(); ctx.arc(cx, bodyY + bob, 19, 0, 6.28); ctx.fill();
                    let tailWag = Math.sin(Date.now()/100)*2;
                    ctx.fillStyle = C_MANE; ctx.fillRect(cx - 3 + tailWag, bodyY + bob, 6, 22);
                }
            }






/// 5. EMPTY BOAT (Parked - 2x2 SIZE)
// 5. EMPTY BOAT (Parked - Vintage Wooden Rowboat)
            // 5. EMPTY BOAT (Parked - Matches Sailing Art)
            else if(e.kind === 'boat') {
                // Center of the object
                let cx = x + (e.w * TILE) / 2; 
                let cy = y + (e.h * TILE) / 2;
                
                // Floating animation
                let tick = Date.now();
                let bob = Math.sin(tick/450) * 2;
                let rock = Math.cos(tick/700) * 0.03; 

                ctx.save();
                ctx.translate(cx, cy + bob);
                ctx.rotate(rock);
                ctx.scale(1.4, 1.4); // Match the scale of sailing mode

                // --- PALETTE (Matches Sailing Mode) ---
                const C_HULL_BASE='#5d4037', C_HULL_DARK='#3e2723', C_HULL_TRIM='#8d6e63'; 
                const C_INT_DARK='#281a17';
                const C_OAR_SHAFT='#d7ccc8', C_OAR_BLADE='#a1887f', C_BRASS='#ffb74d'; 

                // 1. INTERIOR (Dark Shadow)
                ctx.fillStyle = C_INT_DARK;
                ctx.beginPath();
                ctx.moveTo(-30, -5); ctx.quadraticCurveTo(0, 6, 36, -12);
                ctx.lineTo(36, -4); ctx.quadraticCurveTo(0, 14, -30, 0); ctx.fill();

                // 2. SEATS (Thwarts)
                ctx.fillStyle = C_HULL_DARK;
                ctx.fillRect(-18, -4, 8, 14); // Rear seat
                ctx.fillRect(15, -8, 8, 14);  // Front seat

                // 3. OARS (Resting Inside)
                ctx.strokeStyle = C_OAR_SHAFT; ctx.lineWidth = 2;
                // Left Oar tucked in
                ctx.beginPath(); ctx.moveTo(-25, 2); ctx.lineTo(15, 6); ctx.stroke();
                // Right Oar tucked in
                ctx.beginPath(); ctx.moveTo(-25, 6); ctx.lineTo(15, 10); ctx.stroke();
                
                // Oar Blades
                ctx.fillStyle = C_OAR_BLADE;
                ctx.beginPath(); ctx.ellipse(20, 6, 6, 2, 0.2, 0, 6.28); ctx.fill();
                ctx.beginPath(); ctx.ellipse(20, 10, 6, 2, 0.2, 0, 6.28); ctx.fill();

                // 4. HULL (Exterior)
                ctx.fillStyle = C_HULL_BASE;
                ctx.beginPath();
                ctx.moveTo(-32, -4); ctx.quadraticCurveTo(0, 14, 38, -12);
                ctx.lineTo(32, 8); ctx.quadraticCurveTo(0, 20, -28, 8); ctx.fill();

                // 5. DETAILS (Rim & Lines)
                ctx.strokeStyle = C_HULL_DARK; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(-31, 0); ctx.quadraticCurveTo(0, 16, 36, -8); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-29, 5); ctx.quadraticCurveTo(0, 18, 34, 0); ctx.stroke();

                ctx.strokeStyle = C_HULL_TRIM; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(-32, -4); ctx.quadraticCurveTo(0, 14, 38, -12); ctx.stroke();
                
                // Brass Oarlocks
                ctx.fillStyle = C_BRASS; ctx.fillRect(-7, -2, 4, 3);

                ctx.restore();
            }





// 2. CHICKEN (Improved Art)
            else if(e.type === 'chicken') {
                // Animation Logic
                let isWalking = (e.walkTimer > 0);
                let bob = isWalking ? Math.abs(Math.sin(Date.now() / 60)) * 3 : 0;
                let breathe = Math.sin(Date.now() / 300) * 0.5;
                
                let cx = x + 25; 
                let cy = y + 32 - bob - breathe; // Base height

                // A. Shadow (Grounding)
                ctx.fillStyle = 'rgba(0,0,0,0.15)';
                ctx.beginPath(); ctx.ellipse(cx, y + 42, 10, 4, 0, 0, 6.28); ctx.fill();

                // B. Orientation Helpers
                // e.dir -> 0:Up, 1:Right, 2:Down, 3:Left
                let faceDir = (e.dir === 3) ? -1 : 1; // 1 = Right, -1 = Left
                let isVertical = (e.dir === 0 || e.dir === 2);
                
                // C. Legs (Orange)
                ctx.fillStyle = '#ff9800';
                let legWiggle = isWalking ? Math.sin(Date.now()/50)*4 : 0;
                // Draw legs centered if vertical, spread if side view
                if(isVertical) {
                    ctx.fillRect(cx - 4, cy + 12, 2, 8); ctx.fillRect(cx + 2, cy + 12, 2, 8);
                } else {
                    ctx.fillRect(cx - 2 + legWiggle, cy + 12, 2, 8); 
                    ctx.fillRect(cx + 2 - legWiggle, cy + 12, 2, 8);
                }

                // D. Tail Feathers (Fan at the back)
                ctx.fillStyle = '#eee';
                if (e.dir === 1) { // Facing Right -> Tail Left
                    ctx.beginPath(); ctx.arc(cx - 10, cy + 2, 6, 0, 6.28); ctx.fill(); 
                    ctx.beginPath(); ctx.arc(cx - 12, cy - 2, 5, 0, 6.28); ctx.fill(); 
                } else if (e.dir === 3) { // Facing Left -> Tail Right
                    ctx.beginPath(); ctx.arc(cx + 10, cy + 2, 6, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx + 12, cy - 2, 5, 0, 6.28); ctx.fill();
                } else if (e.dir === 0) { // Facing Up (Butt view) -> Big Tail
                     ctx.beginPath(); ctx.arc(cx, cy + 5, 10, 3.14, 0); ctx.fill(); 
                }

                // E. Body (Fluffy "Egg" Shape)
                ctx.fillStyle = '#fff';
                // If facing up/down, round body. If side, oval body.
                if(isVertical) {
                    ctx.beginPath(); ctx.arc(cx, cy + 3, 11, 0, 6.28); ctx.fill();
                } else {
                    ctx.beginPath(); ctx.ellipse(cx, cy + 3, 12, 10, 0, 0, 6.28); ctx.fill();
                }

                // F. Head (Distinct Circle)
                let headX = cx + (isVertical ? 0 : (faceDir * 6));
                let headY = cy - 6;
                ctx.beginPath(); ctx.arc(headX, headY, 7, 0, 6.28); ctx.fill();

                // G. Face Details (Comb, Beak, Eye)
                // Only draw face if NOT facing UP (Back view)
                if (e.dir !== 0) {
                    // Comb (Red)
                    ctx.fillStyle = '#d32f2f';
                    ctx.beginPath(); ctx.arc(headX, headY - 6, 3, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.arc(headX - 2, headY - 5, 2, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.arc(headX + 2, headY - 5, 2, 0, 6.28); ctx.fill();

                    // Beak (Yellow Orange)
                    ctx.fillStyle = '#fbc02d';
                    if (isVertical) { // Facing Camera
                        ctx.beginPath(); ctx.moveTo(headX-2, headY+2); ctx.lineTo(headX+2, headY+2); ctx.lineTo(headX, headY+6); ctx.fill();
                    } else { // Side Profile
                        ctx.beginPath(); ctx.moveTo(headX + (3*faceDir), headY); ctx.lineTo(headX + (9*faceDir), headY+2); ctx.lineTo(headX + (3*faceDir), headY+4); ctx.fill();
                    }

                    // Eye (Black Dot)
                    ctx.fillStyle = '#111';
                    if (isVertical) {
                        ctx.fillRect(headX - 3, headY - 1, 2, 2); ctx.fillRect(headX + 1, headY - 1, 2, 2);
                    } else {
                        ctx.fillRect(headX + (1*faceDir), headY - 2, 2, 2);
                    }
                    
                    // Blush/Cheek (Cute factor)
                    ctx.fillStyle = 'rgba(255, 105, 180, 0.4)';
                    if (isVertical) {
                        ctx.beginPath(); ctx.arc(headX - 4, headY + 3, 2, 0, 6.28); ctx.fill();
                        ctx.beginPath(); ctx.arc(headX + 4, headY + 3, 2, 0, 6.28); ctx.fill();
                    }
                }
                
                // H. Wing (Side View only)
                if (!isVertical) {
                    ctx.fillStyle = '#f0f0f0';
                    ctx.beginPath(); ctx.ellipse(cx - (2*faceDir), cy + 4, 6, 4, 0.2 * faceDir, 0, 6.28); ctx.fill();
                }
            }






////////////////////////////////////////




// 3. COW (Bigger & Aligned)
            else if(e.type === 'cow') {
                // Center X: Middle of the hit box
                let cx = x + (w/2);
                // Center Y: We calculate from the BOTTOM (Feet) up
                // h is the height in pixels. y + h is the bottom of the cow's grid space.
                // We shift up 25px to find the center of the body.
                let cy = y + h - 25; 

                let isWalking = (e.walkTimer > 0);
                let bob = isWalking ? Math.sin(Date.now()/150)*2 : 0;
                let legMove = isWalking ? Math.sin(Date.now()/100)*6 : 0;
                
                let dir = (typeof e.dir !== 'undefined') ? e.dir : 2;

                // A. SIDE VIEW (Left/Right)
                if (dir === 1 || dir === 3) {
                    let d = (dir === 1) ? 1 : -1;
                    
                    // Legs (Thicker & Longer)
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(cx - 20 + legMove, cy + 15, 8, 14);
                    ctx.fillRect(cx + 12 - legMove, cy + 15, 8, 14);

                    // Body (Bigger: 64x40)
                    ctx.fillStyle = '#fff'; 
                    // Safety check for roundRect
                    if (ctx.roundRect) {
                         ctx.beginPath(); ctx.roundRect(cx - 32, cy - 20 + bob, 64, 40, 10); ctx.fill();
                    } else {
                         ctx.fillRect(cx - 32, cy - 20 + bob, 64, 40);
                    }
                    
                    // Spot
                    ctx.fillStyle = '#212121';
                    ctx.beginPath(); ctx.arc(cx - (8*d), cy - 5 + bob, 10, 0, 6.28); ctx.fill();

                    // Head (Bigger: 26px)
                    let hx = cx + (30 * d);
                    let hy = cy - 25 + bob;
                    
                    ctx.fillStyle = '#fff'; ctx.fillRect(hx - 13, hy - 13, 26, 26);
                    ctx.fillStyle = '#f8bbd0'; ctx.fillRect(hx + (2*d), hy + 3, 10 * d, 10); // Nose
                    ctx.fillStyle = '#000'; ctx.fillRect(hx + (2*d), hy - 5, 4, 4); // Eye
                    
                    // Horn
                    ctx.fillStyle = '#bdbdbd'; 
                    ctx.beginPath(); ctx.moveTo(hx, hy-13); ctx.lineTo(hx+(6*d), hy-22); ctx.lineTo(hx+(10*d), hy-13); ctx.fill();
                }
                
                // B. FRONT VIEW (Down)
                else if (dir === 2) {
                    // Legs
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(cx - 20, cy + 15, 8, 14); ctx.fillRect(cx + 12, cy + 15, 8, 14);

                    // Body (Bigger: 50x40)
                    ctx.fillStyle = '#fff';
                    if (ctx.roundRect) {
                        ctx.beginPath(); ctx.roundRect(cx - 25, cy - 20 + bob, 50, 40, 10); ctx.fill();
                    } else {
                        ctx.fillRect(cx - 25, cy - 20 + bob, 50, 40);
                    }

                    // Chest Spot
                    ctx.fillStyle = '#212121';
                    ctx.beginPath(); ctx.arc(cx + 10, cy + bob, 8, 0, 6.28); ctx.fill();

                    // Big Head (32px)
                    let hy = cy - 20 + bob;
                    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 16, hy - 16, 32, 32);
                    ctx.fillStyle = '#f8bbd0'; ctx.fillRect(cx - 16, hy + 8, 32, 8); // Nose
                    ctx.fillStyle = '#000'; ctx.fillRect(cx - 12, hy - 2, 5, 5); ctx.fillRect(cx + 7, hy - 2, 5, 5); // Eyes
                    
                    // Horns
                    ctx.fillStyle = '#bdbdbd';
                    ctx.beginPath(); ctx.moveTo(cx-14, hy-16); ctx.lineTo(cx-22, hy-26); ctx.lineTo(cx-8, hy-16); ctx.fill();
                    ctx.beginPath(); ctx.moveTo(cx+14, hy-16); ctx.lineTo(cx+22, hy-26); ctx.lineTo(cx+8, hy-16); ctx.fill();
                }

                // C. BACK VIEW (Up)
                else { 
                    // Legs
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(cx - 20, cy + 15, 8, 14); ctx.fillRect(cx + 12, cy + 15, 8, 14);

                    // Body
                    ctx.fillStyle = '#fff';
                    if (ctx.roundRect) {
                        ctx.beginPath(); ctx.roundRect(cx - 25, cy - 20 + bob, 50, 40, 10); ctx.fill();
                    } else {
                        ctx.fillRect(cx - 25, cy - 20 + bob, 50, 40);
                    }
                    
                    // Big Butt Spot
                    ctx.fillStyle = '#212121';
                    ctx.beginPath(); ctx.arc(cx - 8, cy - 5 + bob, 12, 0, 6.28); ctx.fill();

                    // Tail
                    ctx.strokeStyle = '#e0e0e0'; ctx.lineWidth = 3;
                    let tailWag = Math.sin(Date.now()/200) * 8;
                    ctx.beginPath(); ctx.moveTo(cx, cy - 10 + bob); ctx.lineTo(cx + tailWag, cy + 10 + bob); ctx.stroke();
                    ctx.fillStyle = '#212121'; ctx.beginPath(); ctx.arc(cx + tailWag, cy + 12 + bob, 3, 0, 6.28); ctx.fill();
                }
            }


////////////////////////////////////////



            


// [PASTE THIS INSIDE THE list.forEach(e => { ... }) LOOP IN draw()]

            // 4. PETS (Fixed Synchronization with House Roof)
            else if(e.type === 'pet') {
                
                // --- A. HOUSE CHECK ---
                let house = S.ents.find(h => h.kind === 'FarmHouse');
                
                // 1. Is Pet Inside? (Use Center Point)
                // We keep +0.5 for the pet so it doesn't clip through the wall visually
                let pInside = house && (e.x+0.5) >= house.x && (e.x+0.5) < house.x + house.w && (e.y+0.5) >= house.y && (e.y+0.5) < house.y + house.h;
                
                // 2. Is Player Inside? (MUST MATCH HOUSE VISIBILITY LOGIC EXACTLY)
                // We use xIn() directly on S.p to sync perfectly with the roof removal
                let plyInside = house && xIn(house, S.p.x, S.p.y);

                // IF Pet is Inside AND Player is Outside -> HIDE SPRITE & SHOW BUBBLE
                if (pInside && !plyInside) {
                    // Bubble Position (Center of House Roof)
                    let bx = (house.x + house.w/2) * TILE - S.cam.x;
                    let by = (house.y) * TILE - S.cam.y - 30; 
                    let bob = Math.sin(Date.now()/300) * 3;

                    // Draw Bubble
                    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.ellipse(bx, by + bob, 18, 14, 0, 0, 6.28); ctx.fill(); ctx.stroke();
                    
                    // Little Triangle Pointer
                    ctx.beginPath(); ctx.moveTo(bx, by + 14 + bob); 
                    ctx.lineTo(bx - 4, by + 22 + bob); ctx.lineTo(bx + 4, by + 14 + bob); 
                    ctx.fill(); ctx.stroke();

                    // Icon
                    ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillStyle = '#000';
                    ctx.fillText(e.kind === 'dog' ? "🐶" : "🐱", bx, by + bob + 2);
                    
                    // Reset Text Align
                    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
                    return; // <--- STOP HERE (Don't draw the actual dog)
                }
                // -----------------------

                // 1. Setup Center & Anchor Logic
                let cx = x + 25;       // Center X
                let feetY = y + 42;    // Feet Position (Ground)
                
                let isWalking = (e.walkTimer > 0) || e.following;
                let bob = isWalking ? Math.abs(Math.sin(Date.now()/100))*3 : 0;
                let lift = feetY - bob; // The height of the body

                // Shadow (Always on ground)
                ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
                ctx.beginPath(); ctx.ellipse(cx, feetY, 12, 5, 0, 0, 6.28); ctx.fill();

                // Direction: 0:Up(Back), 1:Right, 2:Down(Front), 3:Left
                let dir = (typeof e.dir !== 'undefined') ? e.dir : 2; 
                let faceScale = (dir === 3) ? -1 : 1; // Flip for Left

                // === A. DOG ART ===
                if (e.kind === 'dog') {
                    const C_BODY = '#d7ccc8';
                    const C_EAR = '#5d4037';
                    const C_NOSE = '#3e2723';

                    // 1. SIDE VIEW (Right/Left)
                    if (dir === 1 || dir === 3) {
                        // Tail (Wagging at back)
                        let wag = Math.sin(Date.now()/50) * 10;
                        ctx.strokeStyle = C_BODY; ctx.lineWidth = 5; ctx.lineCap='round';
                        ctx.beginPath(); ctx.moveTo(cx - (10*faceScale), lift-8); 
                        ctx.lineTo(cx - (18*faceScale), lift-15+wag); ctx.stroke();

                        // Body
                        ctx.fillStyle = C_BODY;
                        ctx.beginPath(); ctx.ellipse(cx, lift-8, 14, 9, 0, 0, 6.28); ctx.fill();

                        // Head
                        let hx = cx + (8*faceScale);
                        ctx.beginPath(); ctx.arc(hx, lift-18, 9, 0, 6.28); ctx.fill();
                        
                        // Ear (Floppy side)
                        ctx.fillStyle = C_EAR;
                        ctx.beginPath(); ctx.ellipse(hx - (2*faceScale), lift-18, 4, 9, 0, 0, 6.28); ctx.fill();
                        
                        // Snout & Nose
                        ctx.fillStyle = C_BODY; ctx.fillRect(hx + (4*faceScale), lift-18, 6*faceScale, 6);
                        ctx.fillStyle = '#000'; ctx.fillRect(hx + (9*faceScale), lift-19, 3*faceScale, 3);
                    } 
                    // 2. FRONT VIEW (Down)
                    else if (dir === 2) {
                        // Body
                        ctx.fillStyle = C_BODY;
                        ctx.beginPath(); ctx.ellipse(cx, lift-6, 11, 10, 0, 0, 6.28); ctx.fill();
                        // Head
                        ctx.beginPath(); ctx.arc(cx, lift-18, 11, 0, 6.28); ctx.fill();
                        // Ears (Both sides)
                        ctx.fillStyle = C_EAR;
                        ctx.beginPath(); ctx.ellipse(cx - 10, lift-16, 5, 10, 0.2, 0, 6.28); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(cx + 10, lift-16, 5, 10, -0.2, 0, 6.28); ctx.fill();
                        // Face
                        ctx.fillStyle = '#000'; ctx.fillRect(cx-4, lift-20, 2, 2); ctx.fillRect(cx+2, lift-20, 2, 2);
                        ctx.fillStyle = C_NOSE; ctx.fillRect(cx-3, lift-16, 6, 4);
                        // Collar (Red)
                        ctx.fillStyle = '#f44336'; ctx.fillRect(cx-6, lift-9, 12, 2);
                    }
                    // 3. BACK VIEW (Up)
                    else {
                        // Tail (Wagging Center)
                        let wag = Math.sin(Date.now()/50) * 10;
                        ctx.strokeStyle = C_BODY; ctx.lineWidth = 5; ctx.lineCap='round';
                        ctx.beginPath(); ctx.moveTo(cx, lift-8); ctx.lineTo(cx+wag, lift-15); ctx.stroke();
                        // Body
                        ctx.fillStyle = C_BODY;
                        ctx.beginPath(); ctx.ellipse(cx, lift-6, 11, 10, 0, 0, 6.28); ctx.fill();
                        // Head
                        ctx.beginPath(); ctx.arc(cx, lift-18, 11, 0, 6.28); ctx.fill();
                        // Ears (From behind)
                        ctx.fillStyle = C_EAR;
                        ctx.beginPath(); ctx.ellipse(cx - 9, lift-16, 4, 9, 0.2, 0, 6.28); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(cx + 9, lift-16, 4, 9, -0.2, 0, 6.28); ctx.fill();
                    }
                } 

                // === B. CAT ART ===
                else {
                    const C_BODY = '#ffcc80'; // Orange
                    const C_STRIPE = '#ef6c00'; // Dark Orange
                    const C_NOSE = '#f48fb1'; // Pink

                    // 1. SIDE VIEW
                    if (dir === 1 || dir === 3) {
                        // Tail (Curved Up)
                        ctx.strokeStyle = C_BODY; ctx.lineWidth = 4; ctx.lineCap='round';
                        ctx.beginPath(); ctx.moveTo(cx-(10*faceScale), lift-5); 
                        ctx.quadraticCurveTo(cx-(20*faceScale), lift-15, cx-(15*faceScale), lift-25); ctx.stroke();

                        // Body
                        ctx.fillStyle = C_BODY;
                        ctx.beginPath(); ctx.ellipse(cx, lift-5, 12, 8, 0, 0, 6.28); ctx.fill();
                        // Stripe
                        ctx.fillStyle = C_STRIPE; ctx.fillRect(cx-2, lift-12, 4, 4);

                        // Head
                        let hx = cx + (7*faceScale);
                        ctx.fillStyle = C_BODY; ctx.beginPath(); ctx.arc(hx, lift-16, 9, 0, 6.28); ctx.fill();
                        // Ear (Pointy)
                        ctx.beginPath(); ctx.moveTo(hx, lift-22); ctx.lineTo(hx+(5*faceScale), lift-30); ctx.lineTo(hx+(8*faceScale), lift-20); ctx.fill();
                        // Face
                        ctx.fillStyle = '#000'; ctx.fillRect(hx + (4*faceScale), lift-18, 2, 2);
                        ctx.fillStyle = C_NOSE; ctx.fillRect(hx + (7*faceScale), lift-16, 2, 2);
                    }
                    // 2. FRONT VIEW
                    else if (dir === 2) {
                        // Body
                        ctx.fillStyle = C_BODY;
                        ctx.beginPath(); ctx.ellipse(cx, lift-4, 10, 9, 0, 0, 6.28); ctx.fill();
                        // Head
                        ctx.beginPath(); ctx.arc(cx, lift-16, 10, 0, 6.28); ctx.fill();
                        // Stripes
                        ctx.fillStyle = C_STRIPE; 
                        ctx.beginPath(); ctx.moveTo(cx, lift-24); ctx.lineTo(cx-2, lift-20); ctx.lineTo(cx+2, lift-20); ctx.fill();
                        // Ears (Pointy)
                        ctx.fillStyle = C_BODY;
                        ctx.beginPath(); ctx.moveTo(cx-8, lift-20); ctx.lineTo(cx-10, lift-28); ctx.lineTo(cx-2, lift-22); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx+8, lift-20); ctx.lineTo(cx+10, lift-28); ctx.lineTo(cx+2, lift-22); ctx.fill();
                        // Face
                        ctx.fillStyle = '#000'; ctx.fillRect(cx-4, lift-18, 2, 2); ctx.fillRect(cx+2, lift-18, 2, 2);
                        ctx.fillStyle = C_NOSE; ctx.fillRect(cx-2, lift-15, 4, 3);
                    }
                    // 3. BACK VIEW
                    else {
                        // Tail (Straight Up)
                        ctx.strokeStyle = C_BODY; ctx.lineWidth = 4; ctx.lineCap='round';
                        ctx.beginPath(); ctx.moveTo(cx, lift-5); ctx.lineTo(cx, lift-25); ctx.stroke();
                        // Body
                        ctx.fillStyle = C_BODY;
                        ctx.beginPath(); ctx.ellipse(cx, lift-4, 10, 9, 0, 0, 6.28); ctx.fill();
                        // Head
                        ctx.beginPath(); ctx.arc(cx, lift-16, 10, 0, 6.28); ctx.fill();
                        // Ears
                        ctx.beginPath(); ctx.moveTo(cx-8, lift-20); ctx.lineTo(cx-10, lift-28); ctx.lineTo(cx-2, lift-22); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx+8, lift-20); ctx.lineTo(cx+10, lift-28); ctx.lineTo(cx+2, lift-22); ctx.fill();
                    }
                }
            }



           
////////////////////////////
 		// 2. STRUCTURES
            else if(e.type === 'struct') {
                
               // --- A. FARMHOUSE ---
                if(e.kind === 'FarmHouse') {
                    if (isInside) {
                        // === INTERIOR (Unchanged) ===
                        ctx.fillStyle = '#f5b041'; ctx.fillRect(x, y, w, h); 
                        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(x, y, w, 5); ctx.fillRect(x, y+h-5, w, 5);
                        ctx.fillStyle = '#cfd8dc'; ctx.fillRect(x, y, w, 25); 
                        ctx.fillStyle = '#37474f'; ctx.fillRect(x, y+25, w, 3); 
                        let rx = x + w/2 - 35, ry = y + h/2 - 10;
                        ctx.fillStyle = '#263238'; ctx.fillRect(rx, ry, 70, 45);
                        ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 3; ctx.strokeRect(rx, ry, 70, 45);
                        ctx.fillStyle = '#37474f'; ctx.fillRect(rx+15, ry, 10, 45); ctx.fillRect(rx+45, ry, 10, 45);
                        ctx.fillStyle = '#263238'; let thk = 15;
                        ctx.fillRect(x, y, w, thk); ctx.fillRect(x, y, thk, h); ctx.fillRect(x+w-thk, y, thk, h); 
                        let doorW = TILE; let doorOffset = (S.farm.houseLevel === 1) ? 3 : 4; let doorX = x + doorOffset*TILE;
                        ctx.fillRect(x, y+h-thk, doorX - x, thk); ctx.fillRect(doorX + doorW, y+h-thk, (x+w)-(doorX+doorW), thk);

                    } else {
                        // === EXTERIOR ===
                        let centerX = x + w/2;
                        let roofH = 60; let wallY = y + roofH - 10; let wallH = h - roofH + 10;

                        // --- STAGE 1: ORIGINAL (Untouched) ---
                        if (S.farm.houseLevel === 1) {
                            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(centerX, y + h - 5, w/2 + 10, 10, 0, 0, 6.28); ctx.fill();
                            ctx.fillStyle = '#546e7a'; ctx.fillRect(x + 5, y + h - 20, w - 10, 20);
                            ctx.fillStyle = '#37474f'; for(let i=x+5; i<x+w-10; i+=15) ctx.fillRect(i, y+h-20, 2, 20);
                            ctx.fillStyle = '#fff3e0'; ctx.fillRect(x + 8, wallY, w - 16, wallH - 20);
                            ctx.fillStyle = 'rgba(0,0,0,0.03)'; for(let i=wallY; i < wallY + wallH - 20; i+=10) ctx.fillRect(x+8, i, w-16, 1);
                            ctx.fillStyle = '#5d4037'; ctx.fillRect(x + 5, wallY, 8, wallH); ctx.fillRect(x + w - 13, wallY, 8, wallH);
                            let ridgeWidth = 80; ctx.fillStyle = '#c62828'; ctx.beginPath(); ctx.moveTo(x - 15, wallY + 10); ctx.lineTo(centerX - (ridgeWidth/2), y - 10); ctx.lineTo(centerX + (ridgeWidth/2), y - 10); ctx.lineTo(x + w + 15, wallY + 10); ctx.closePath(); ctx.fill();
                            ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.stroke();
                            let chimBase = wallY - 30; ctx.fillStyle = '#546e7a'; ctx.fillRect(x + w - 40, chimBase, 20, 30); ctx.fillStyle = '#37474f'; ctx.fillRect(x + w - 42, chimBase - 5, 24, 6);
                            let t = Date.now() / 400; let smokeX = x + w - 30; let smokeY = chimBase - 10; ctx.fillStyle = 'rgba(255,255,255,0.7)'; let s1 = (t % 3); ctx.beginPath(); ctx.arc(smokeX, smokeY - (s1 * 10), 4 + s1, 0, 6.28); ctx.fill(); let s2 = ((t + 1) % 3); ctx.beginPath(); ctx.arc(smokeX + 5, smokeY - (s2 * 10) - 5, 4 + s2, 0, 6.28); ctx.fill();
                            let doorW = 46; let doorX = centerX - (doorW/2);
                            ctx.fillStyle = '#3e2723'; ctx.fillRect(doorX - 4, y + h - 64, doorW + 8, 64); ctx.fillStyle = '#8d6e63'; ctx.fillRect(doorX, y + h - 62, doorW, 62);
                            ctx.fillStyle = '#6d4c41'; ctx.fillRect(doorX + 6, y + h - 62 + 6, doorW - 12, 20); ctx.fillRect(doorX + 6, y + h - 62 + 32, doorW - 12, 25);
                            ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(doorX + 6, y + h - 30, 4, 0, 6.28); ctx.fill();
                            const drawWin1 = (wx, wy) => { ctx.fillStyle = '#5d4037'; ctx.fillRect(wx - 2, wy - 2, 46, 46); ctx.fillStyle = '#fff59d'; ctx.fillRect(wx, wy, 42, 42); ctx.fillStyle = '#5d4037'; ctx.fillRect(wx + 21 - 2, wy, 4, 42); ctx.fillRect(wx, wy + 21 - 2, 42, 4); ctx.fillStyle = '#2e7d32'; ctx.fillRect(wx - 2, wy + 38, 46, 6); };
                            drawWin1(centerX + 65, wallY + 50); 
                        }

                        // --- STAGE 2: RUSTIC LOG CABIN ---
                        else if (S.farm.houseLevel === 2) {
                            let roofTop = y - 30; let eaveY = y + 55; let floorY = y + h;
                            
                            ctx.fillStyle = '#3e2723'; ctx.fillRect(x, floorY - 20, w, 20); 
                            ctx.fillStyle = '#211612'; ctx.fillRect(x + 10, eaveY, w - 20, floorY - eaveY - 20);
                            for(let ly = eaveY; ly < floorY - 20; ly += 12) {
                                ctx.fillStyle = '#795548'; ctx.fillRect(x + 8, ly, w - 16, 10);
                                ctx.fillStyle = '#4e342e'; ctx.fillRect(x + 8, ly+9, w - 16, 1);
                            }
                            ctx.fillStyle = '#4e342e'; ctx.fillRect(x+15, eaveY, 12, floorY-eaveY-20); ctx.fillRect(x+w-27, eaveY, 12, floorY-eaveY-20);

                            ctx.beginPath(); ctx.moveTo(x - 20, eaveY + 10); ctx.lineTo(centerX, roofTop); ctx.lineTo(x + w + 20, eaveY + 10); ctx.closePath();
                            ctx.fillStyle = '#4e342e'; ctx.fill();
                            ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 6; ctx.stroke();

                            let chimX = x + w - 55; 
                            let chimY = roofTop + 55; 
                            let chimH = 37; 
                            ctx.fillStyle = '#7f8c8d'; ctx.fillRect(chimX, chimY - chimH + 22, 18, chimH); 
                            ctx.fillStyle = '#546e7a'; ctx.fillRect(chimX - 2, chimY - chimH + 22 - 5, 22, 5); 
                            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(chimX+4, chimY - 10, 6, 4); 
                            
                            let t = Date.now() / 400; ctx.fillStyle = 'rgba(255,255,255,0.6)';
                            ctx.beginPath(); ctx.arc(chimX+9, chimY - chimH + 10 - (t%3 * 10), 4 + (t%3), 0, 6.28); ctx.fill();

                            let doorW = 46; let doorH = 62; let dX = centerX - (doorW/2); let dY = floorY - doorH - 10;
                            ctx.fillStyle = '#9e9e9e'; ctx.fillRect(dX - 4, floorY - 10, doorW + 8, 10); 
                            ctx.fillStyle = '#757575'; ctx.fillRect(dX - 4, floorY - 2, doorW + 8, 2);
                            ctx.fillStyle = '#3e2723'; ctx.fillRect(dX - 4, dY - 2, doorW + 8, doorH + 2); 
                            ctx.fillStyle = '#8d6e63'; ctx.fillRect(dX, dY, doorW, doorH); 
                            ctx.fillStyle = '#6d4c41'; ctx.fillRect(dX + 6, dY + 6, doorW - 12, 20); ctx.fillRect(dX + 6, dY + 32, doorW - 12, 25);
                            ctx.fillStyle = '#ffd700'; ctx.beginPath(); ctx.arc(dX + 6, dY + 32, 4, 0, 6.28); ctx.fill();

                            const drawCabinWin = (wx, wy) => {
                                ctx.fillStyle = '#3e2723'; ctx.fillRect(wx, wy, 40, 40);
                                ctx.fillStyle = '#81d4fa'; ctx.fillRect(wx+4, wy+4, 32, 32);
                                ctx.fillStyle = '#3e2723'; ctx.fillRect(wx+18, wy+4, 4, 32); ctx.fillRect(wx+4, wy+18, 32, 4);
                            };
                            drawCabinWin(x + 85, eaveY + 35); 
                            drawCabinWin(x + w - 125, eaveY + 35); 
                        }

                        // --- STAGE 3: VICTORIAN QUEEN ANNE ---
                        else if (S.farm.houseLevel === 3) {
                            let floorY = y + h;
                            
                            let porchCeilingH = 120; 
                            let porchRoofY = floorY - porchCeilingH; 
                            let secondFloorH = 95; 
                            let secondFloorTopY = porchRoofY - secondFloorH; 
                            let roofH = 90; 
                            let roofPeakY = secondFloorTopY - roofH; 
                            
                            let turretW = 120; 
                            let turretX = x + w - turretW + 25; 
                            let mainBodyW = w - turretW + 40; 

                            const C_WALL = '#efebe9'; const C_TRIM = '#fff'; const C_ROOF = '#263238'; const C_SHINGLES = '#8d6e63'; 

                            // 1. SHADOW
                            ctx.fillStyle = 'rgba(0,0,0,0.3)';
                            ctx.beginPath();
                            ctx.ellipse(centerX, floorY + 12, (w/2) + 8, 10, 0, 0, 6.28);
                            ctx.fill();

                            // 2. CHIMNEY (Left)
                            let chimX = x + 70;
                            let chimBaseY = roofPeakY - 10; 
                            ctx.fillStyle = '#8d6e63'; ctx.fillRect(chimX, chimBaseY, 24, 70);
                            ctx.fillStyle = '#3e2723'; ctx.fillRect(chimX - 4, chimBaseY - 5, 32, 8);
                            let t = Date.now() / 400; let smokeX = chimX + 12; let smokeY = chimBaseY - 10;
                            ctx.fillStyle = 'rgba(255,255,255,0.6)';
                            let s1 = (t % 3); ctx.beginPath(); ctx.arc(smokeX, smokeY - (s1 * 10), 5 + s1, 0, 6.28); ctx.fill();
                            let s2 = ((t + 1) % 3); ctx.beginPath(); ctx.arc(smokeX + 8, smokeY - (s2 * 10) - 8, 5 + s2, 0, 6.28); ctx.fill();

                            // 3. MAIN WALLS
                            ctx.fillStyle = C_WALL;
                            ctx.fillRect(x + 15, porchRoofY, mainBodyW, porchCeilingH); 
                            ctx.fillRect(x + 15, secondFloorTopY, mainBodyW - 5, secondFloorH); 

                            // 4. MAIN ROOF (Under Tower)
                            ctx.fillStyle = C_ROOF;
                            ctx.beginPath(); ctx.moveTo(x - 5, secondFloorTopY); ctx.lineTo(x + (mainBodyW/2), roofPeakY); ctx.lineTo(x + mainBodyW + 15, secondFloorTopY); ctx.fill();
                            ctx.fillStyle = C_SHINGLES;
                            ctx.beginPath(); ctx.moveTo(x + 20, secondFloorTopY); ctx.lineTo(x + (mainBodyW/2), roofPeakY + 25); ctx.lineTo(x + mainBodyW, secondFloorTopY); ctx.fill();

                            // 5. TOWER (Over Roof)
                            ctx.fillStyle = C_WALL;
                            ctx.fillRect(turretX, secondFloorTopY - 10, turretW - 20, floorY - secondFloorTopY + 5); 
                            ctx.fillStyle = 'rgba(0,0,0,0.05)'; 
                            ctx.fillRect(turretX, secondFloorTopY - 10, 25, floorY - secondFloorTopY);
                            ctx.fillRect(turretX + turretW - 45, secondFloorTopY - 10, 25, floorY - secondFloorTopY);
                            // Spire
                            let turPeak = roofPeakY - 60; let turCenter = turretX + (turretW-20)/2;
                            ctx.fillStyle = '#37474f'; 
                            ctx.beginPath(); ctx.moveTo(turretX - 20, secondFloorTopY - 10); ctx.lineTo(turCenter, turPeak); ctx.lineTo(turretX + turretW, secondFloorTopY - 10); ctx.fill();
                            ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(turCenter, turPeak); ctx.lineTo(turCenter, turPeak - 35); ctx.stroke();

                            // 6. PORCH ROOF (1st Floor) - EXTENDED
                            ctx.fillStyle = C_ROOF;
                            ctx.beginPath(); 
                            // Fix: Top left moved to (x - 15) to extend along with bottom left (x - 47)
                            ctx.moveTo(x - 47, porchRoofY + 15); // Bottom Left (Extended)
                            ctx.lineTo(x - 15, porchRoofY - 20); // Top Left (Extended leftwards)
                            ctx.lineTo(x + w + 20, porchRoofY - 20); // Top Right
                            ctx.lineTo(x + w + 60, porchRoofY + 15); // Bottom Right
                            ctx.closePath(); 
                            ctx.fill();
                            // Trim extended
                            ctx.fillStyle = '#37474f'; ctx.fillRect(x - 45, porchRoofY + 12, w + 97, 3); 

                            // 7. WINDOWS
                            const drawVicWin = (vx, vy, vw, vh, color) => {
                                ctx.fillStyle = color || '#fff'; ctx.fillRect(vx-4, vy-4, vw+8, vh+8); 
                                ctx.fillStyle = '#212121'; ctx.fillRect(vx, vy, vw, vh); 
                                ctx.fillStyle = color || '#fff'; ctx.fillRect(vx, vy + vh/2, vw, 3); 
                            };
                            
                            // Bay Windows
                            ctx.fillStyle = C_TRIM; ctx.fillRect(x + 35, porchRoofY + 30, 80, 60);
                            drawVicWin(x + 35, porchRoofY + 35, 30, 50, '#4e342e'); 
                            drawVicWin(x + 80, porchRoofY + 35, 30, 50, '#4e342e'); 

                            // 2nd Floor
                            drawVicWin(x + 60, secondFloorTopY + 10, 35, 55);
                            drawVicWin(x + 130, secondFloorTopY + 10, 35, 55);

                            // Turret
                            drawVicWin(turretX + 30, secondFloorTopY, 35, 60);

                            // 8. DOOR
                            let dX = x + 200; let dW = 54; let dH = 85; 
                            let doorY = floorY - dH - 10;
                            ctx.fillStyle = '#3e2723'; ctx.fillRect(dX, doorY, dW, dH);
                            ctx.fillStyle = '#5d4037'; ctx.fillRect(dX + 6, doorY + 6, dW - 12, dH - 12);
                            ctx.fillStyle = '#81d4fa'; ctx.fillRect(dX + 12, doorY + 25, dW - 24, 35);
                            ctx.fillStyle = '#ffd700'; ctx.fillRect(dX + dW - 12, doorY + dH/2, 6, 6); 

                            // 9. COLUMNS
                            const drawCol = (cx) => {
                                ctx.fillStyle = '#fff'; ctx.fillRect(cx, porchRoofY + 15, 14, porchCeilingH - 30); 
                                ctx.fillStyle = '#cfd8dc'; ctx.fillRect(cx-4, porchRoofY+15, 22, 6); ctx.fillRect(cx-4, floorY-15, 22, 6);
                            };
                            drawCol(x); drawCol(x + 110); drawCol(x + 185); drawCol(turretX + 10);

                            // 10. FOUNDATION / DECK
                            ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x, floorY - 5, w, 20); 
                            ctx.fillStyle = '#546e7a'; ctx.fillRect(x + 10, floorY - 5, w - 20, 17); 
                            ctx.fillStyle = '#795548'; ctx.fillRect(x - 10, floorY - 15, w + 20, 15); 
                            ctx.fillStyle = '#5d4037'; ctx.fillRect(x - 10, floorY - 2, w + 20, 3); 

                            // 11. STEPS
                            let stepY = floorY - 15;
                            ctx.fillStyle = '#795548'; ctx.fillRect(dX - 5, stepY, dW + 10, 8); 
                            ctx.fillStyle = '#8d6e63'; ctx.fillRect(dX - 10, stepY + 8, dW + 20, 8); 
                            ctx.fillStyle = '#a1887f'; ctx.fillRect(dX - 15, stepY + 16, dW + 30, 8); 
                            ctx.fillStyle = '#5d4037'; ctx.fillRect(dX - 20, stepY + 24, dW + 40, 9); 
                        }
                    }
                }



                // --- B. TELEBOOTH ---
                else if(e.kind === 'Telebooth') {
                     ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x+w/2, y+h-5, w/2, 10, 0, 0, 6.28); ctx.fill();
                     ctx.fillStyle = '#b71c1c'; ctx.fillRect(x+5, y+5, w-10, h-5); // Darker Red
                     ctx.fillStyle = '#e53935'; ctx.fillRect(x+8, y+8, w-16, h-8); // Lighter Red
                     ctx.fillStyle = '#e1f5fe'; // Glass
                     let gx = x+12, gy = y+20; let gw = (w-24)/2, gh = (h-40)/3;
                     for(let r=0; r<3; r++) for(let c=0; c<2; c++) ctx.fillRect(gx + c*(gw+2), gy + r*(gh+2), gw, gh);
                }
                // --- C. BED (Black Iron Bachelor Style) ---
                else if(e.kind === 'Bed') {
                    if(isInside) { 
                        // 1. Black Iron Frame
                        ctx.fillStyle = '#212121'; 
                        ctx.fillRect(x, y, 4, h); ctx.fillRect(x+w-4, y, 4, h); // Legs
                        ctx.fillRect(x, y, w, 8); // Headboard frame

                        // 2. Mattress
                        ctx.fillStyle = '#cfd8dc'; ctx.fillRect(x+4, y+8, w-8, h-8);
                        
                        // 3. Navy Sheets (No quilt, just solid masculine color)
                        ctx.fillStyle = '#1a237e'; // Deep Navy
                        ctx.fillRect(x+4, y+25, w-8, h-25);
                        
                        // 4. White Pillow (Simple)
                        ctx.fillStyle = '#fff'; 
                        ctx.fillRect(x+w/2-10, y+10, 20, 10);
                    }
                }
                // --- D. TABLE (With Leather Placemat) ---
                else if(e.kind === 'Table') {
                    if(isInside) { 
                        // Legs
                        ctx.fillStyle = '#3e2723'; 
                        ctx.fillRect(x+2, y+2, 8, 8); ctx.fillRect(x+w-10, y+2, 8, 8);
                        ctx.fillRect(x+2, y+h-10, 8, 8); ctx.fillRect(x+w-10, y+h-10, 8, 8);

                        // Top
                        ctx.fillStyle = '#5d4037'; ctx.fillRect(x, y, w, h);
                        
                        // LEATHER PLACEMAT (Dark Brown Rect)
                        ctx.fillStyle = '#3e2723'; 
                        ctx.fillRect(x+8, y+8, w-16, h-16);
                        
                        // Mug (Grey)
                        ctx.fillStyle = '#90a4ae'; ctx.fillRect(x+w/2-3, y+h/2-4, 6, 8);
                    }
                }
                // --- E. BIN & WELL (Art Upgrade) ---
                else if(e.kind === 'ShippingBin') {
                    // Shadow
                    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(x+5, y+h-5, w-10, 5);
                    
                    // 1. Main Box (Red-Brown Wood)
                    ctx.fillStyle='#5d4037'; ctx.fillRect(x+5, y+15, w-10, h-20);
                    
                    // 2. Wood Planks (Horizontal Lines)
                    ctx.fillStyle='#4e342e'; 
                    for(let i=y+25; i<y+h-5; i+=10) ctx.fillRect(x+5, i, w-10, 2);

                    // 3. Metal Corners (Blue-Grey Iron)
                    ctx.fillStyle='#546e7a'; 
                    ctx.fillRect(x+5, y+15, 8, h-20); // Left
                    ctx.fillRect(x+w-13, y+15, 8, h-20); // Right
                    ctx.fillStyle='#cfd8dc'; // Rivets
                    ctx.fillRect(x+7, y+20, 2, 2); ctx.fillRect(x+7, y+h-10, 2, 2);
                    ctx.fillRect(x+w-11, y+20, 2, 2); ctx.fillRect(x+w-11, y+h-10, 2, 2);

                    // 4. The Lid (Slightly Open - Dark inside)
                    ctx.fillStyle='#3e2723'; // Inside Darkness
                    ctx.beginPath(); ctx.moveTo(x+5, y+15); ctx.lineTo(x+w-5, y+5); ctx.lineTo(x+w-5, y+15); ctx.fill();
                    
                    // Lid Top Surface
                    ctx.fillStyle='#8d6e63'; 
                    ctx.beginPath(); ctx.moveTo(x+5, y+15); ctx.lineTo(x+w-5, y+5); 
                    ctx.lineTo(x+w, y+8); ctx.lineTo(x+10, y+18); ctx.fill();
                    
                    // 5. Symbol (Paper Label)
                    ctx.fillStyle='#fff'; ctx.fillRect(x+25, y+40, 30, 20);
                    ctx.fillStyle='#000'; ctx.font='bold 10px monospace'; ctx.fillText("SHIP", x+27, y+53);
                }

                else if(e.kind === 'Well') {
                    let cx = x + w/2;
                    let cy = y + h/2 + 10;
                    
                    // 1. Stone Base (Individual Bricks)
                    // Background Mortar
                    ctx.fillStyle='#455a64'; ctx.beginPath(); ctx.ellipse(cx, cy, w/2-5, 15, 0, 0, 6.28); ctx.fill();
                    ctx.fillRect(x+10, cy, w-20, 25);
                    ctx.beginPath(); ctx.ellipse(cx, cy+25, w/2-5, 15, 0, 0, 6.28); ctx.fill();

                    // Bricks (Grey/Blue variations)
                    let cols = ['#90a4ae', '#78909c'];
                    for(let r=0; r<3; r++) {
                        for(let c=0; c<4; c++) {
                            ctx.fillStyle = cols[(r+c)%2];
                            ctx.fillRect(x+10 + (c*18), cy + (r*8), 16, 6);
                        }
                    }

                    // 2. Water (Dark Depth)
                    ctx.fillStyle='#01579b'; ctx.beginPath(); ctx.ellipse(cx, cy, w/2-10, 10, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle='#0288d1'; ctx.beginPath(); ctx.ellipse(cx, cy, w/2-15, 6, 0, 0, 6.28); ctx.fill(); // Reflection

                    // 3. Wooden Roof Pillars
                    ctx.fillStyle='#5d4037'; 
                    ctx.fillRect(x+15, y+10, 6, 50); // Left
                    ctx.fillRect(x+w-21, y+10, 6, 50); // Right

                    // 4. The Roof (Triangle)
                    ctx.fillStyle='#3e2723'; 
                    ctx.beginPath(); ctx.moveTo(x+5, y+15); ctx.lineTo(cx, y-5); ctx.lineTo(x+w-5, y+15); ctx.fill();
                    // Roof Overhang/Thickness
                    ctx.fillStyle='#5d4037';
                    ctx.beginPath(); ctx.moveTo(x+5, y+15); ctx.lineTo(x+w-5, y+15); ctx.lineTo(x+w-5, y+20); ctx.lineTo(x+5, y+20); ctx.fill();

                    // 5. Bucket (Hanging)
                    ctx.strokeStyle='#d7ccc8'; ctx.lineWidth=1; 
                    ctx.beginPath(); ctx.moveTo(cx, y+15); ctx.lineTo(cx, y+35); ctx.stroke(); // Rope
                    ctx.fillStyle='#8d6e63'; ctx.fillRect(cx-6, y+35, 12, 10); // Bucket
                    ctx.fillStyle='#000'; ctx.fillRect(cx-4, y+35, 8, 2); // Inside
                }
            }


//////////////////////////

// NEW: 2x2 Obstacles (Irregular Root Base)
            else if(e.type === 'obs') {
                let cx = x + (e.w*TILE)/2;
                let cy = y + (e.h*TILE)/2;
                







// --- PRO ART V2: ROUGH & NATURAL CAMPFIRE (Smoother Fade) ---
               if (e.kind === 'campfire') {
                    let cx = x + TILE; 
                    let cy = y + TILE + 10;

                     
                    // --- 1. ASH PIT (Shadow) ---
                    // Only draw if lit AND fuel is > 20
                    if (e.lit && e.fuel > 20) {
                        let fuelRatio = Math.max(0, Math.min(1.0, (e.fuel - 20) / 40.0));
                        if (fuelRatio > 0.01) {
                            let ashGrad = ctx.createRadialGradient(cx, cy+5, 8, cx, cy+5, 38);
                            ashGrad.addColorStop(0, `rgba(50, 40, 40, ${0.4 * fuelRatio})`);   
                            ashGrad.addColorStop(1, 'rgba(50, 40, 40, 0)');     
                            ctx.fillStyle = ashGrad;
                            ctx.fillRect(cx - 40, cy - 35, 80, 80); 
                        }
                    }

                    // --- 2. ROUGH LOGS ---
                    const drawRoughLog = (angle, len, width) => {
                        ctx.save(); ctx.translate(cx, cy); ctx.rotate(angle);
                        ctx.fillStyle = '#4e342e'; 
                        ctx.beginPath();
                        ctx.moveTo(-width/2, -len); ctx.lineTo(width/2, -len); 
                        ctx.lineTo(width/2 + 2, -len/2); ctx.lineTo(width/2, 0); ctx.lineTo(width/2 + 1, len/2);
                        ctx.lineTo(width/2, len); ctx.lineTo(-width/2, len);
                        ctx.lineTo(-width/2 - 2, len/2); ctx.lineTo(-width/2, 0); ctx.lineTo(-width/2 - 1, -len/2);
                        ctx.fill();
                        ctx.fillStyle = '#3e2723'; ctx.fillRect(-2, -len+5, 3, len-10); 
                        ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.ellipse(0, -len, width/2, width/4, 0, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.arc(0, -len, 2, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.ellipse(0, len, width/2, width/4, 0, 0, 6.28); ctx.fill();
                        ctx.restore();
                    };
                    drawRoughLog(0.6, 28, 12); drawRoughLog(2.5, 28, 13); drawRoughLog(4.8, 28, 12);

                    // --- 3. STONES ---
                    for(let i=0; i<9; i++) {
                        let a = (i / 9) * 6.28;
                        let sx = cx + Math.cos(a) * 42;
                        let sy = cy + Math.sin(a) * 23;
                        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.arc(sx, sy+4, 9, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#37474f'; 
                        ctx.beginPath(); ctx.moveTo(sx-8, sy); ctx.lineTo(sx-5, sy-6); ctx.lineTo(sx+6, sy-5);
                        ctx.lineTo(sx+9, sy+2); ctx.lineTo(sx+2, sy+7); ctx.lineTo(sx-6, sy+5); ctx.fill();
                        ctx.fillStyle = '#78909c'; 
                        ctx.beginPath(); ctx.moveTo(sx-5, sy-6); ctx.lineTo(sx+6, sy-5); ctx.lineTo(sx+9, sy+2); ctx.lineTo(sx-2, sy+1); ctx.fill();
                    }

                    // --- 4. FIRE (With Shrink Logic) ---
                    if (e.lit) {
                        let fireScale = Math.min(1.0, e.fuel / 40.0);
                        if (fireScale < 0.1) fireScale = 0.1; 

                        let t = Date.now() / 120; 
                        let flicker = Math.sin(t*3) * 5;
                        let sway = Math.cos(t) * 5;

                        // Inner Glow (Layer 2)
                        let glowR = (50 + Math.sin(t)*5) * fireScale;
                        let g = ctx.createRadialGradient(cx, cy, 10 * fireScale, cx, cy, glowR);
                        g.addColorStop(0, 'rgba(255, 87, 34, 0.7)');
                        g.addColorStop(1, 'rgba(255, 87, 34, 0)');
                        ctx.fillStyle = g;
                        ctx.beginPath(); ctx.ellipse(cx, cy-10, glowR, glowR*0.6, 0, 0, 6.28); ctx.fill();

                        const drawFlame = (ox, oy, w, h, col) => {
                             ctx.fillStyle = col; ctx.beginPath();
                             ctx.moveTo(cx + (ox*fireScale) - (w*fireScale), cy + oy);
                             ctx.quadraticCurveTo(cx + (ox*fireScale) + sway, cy + oy - (h*fireScale), cx + (ox*fireScale) + (w*fireScale), cy + oy);
                             ctx.fill();
                        };

                        drawFlame(0, 0, 18, 55 + flicker, '#e64a19'); 
                        drawFlame(-5, 2, 12, 40 + flicker, '#ff9800'); 
                        drawFlame(5, 2, 12, 38 - flicker, '#ff9800');  
                        drawFlame(0, 5, 8, 25 + flicker, '#fff176');   
                        
                        if(Math.random() < 0.2 * fireScale) {
                            ctx.fillStyle = '#ffeb3b';
                            ctx.fillRect(cx + (Math.random()-0.5)*30, cy - 20 - Math.random()*30, 3, 3);
                        }
                    } else {
                        // Cold Ash
                        ctx.fillStyle = '#9e9e9e'; ctx.fillRect(cx-5, cy-5, 2, 2); ctx.fillRect(cx+4, cy-2, 2, 2);
                    }
                    return;
                }










// [REPLACE / INSERT HERE]
                // --- NEW: SEA ROCK (Jagged & Mossy) ---
                // [TOP CONTEXT]
                // --- NEW: SEA ROCK (High-Fidelity Reef Cluster) ---
                // --- NEW: SEA ROCK (Universal Aspect Ratio Lock) ---
           // --- NEW: SEA ROCK (Matte Reef Style) ---
           // --- NEW: SEA ROCK (Round w/ 2 Colors + Sprawled w/ 2 Colors & Sizes) ---
            if (e.kind === 'sea_rock') {
                let w = e.w * TILE;
                let h = e.h * TILE;
                let cx = x + w/2;
                let cy = y + h;

                // 1. GENERATE SEED
                let seed = Math.abs(Math.sin(e.x * 12.9898 + e.y * 78.233));
                let varSeed = Math.floor(seed * 100); 
                
                // VARIANT LOGIC:
                let variant = (e.w >= 3) ? 2 : (varSeed % 2); 





// --- INSERTION 1: MOSS LOGIC ---
                // 0: None, 1: Pixels, 2: Gradient
                let mossType = Math.floor(seed * 1000) % 3; 

                const drawMoss = (sx, sy, mw, mh) => {
                    if (mossType === 0) return; 

                    ctx.save();
                    ctx.clip(); // Clip to the rock shape currently in the path

                    if (mossType === 1) { // PIXELS
                        let count = 8 + (mw / 4);
                        for(let k=0; k<count; k++) {
                            let r = Math.sin(k * 45.1 + e.x) * 123.45;
                            let px = sx + Math.abs((r * 10) % mw); 
                            let py = sy + Math.abs((r * 20) % mh);
                            ctx.fillStyle = (k%2===0) ? '#33691e' : '#558b2f'; 
                            ctx.fillRect(px, py, 2, 2);
                        }
                    }
                    else if (mossType === 2) { // GRADIENT
                        let g = ctx.createLinearGradient(sx, sy, sx + mw/1.5, sy + mh/1.5);
                        g.addColorStop(0, 'rgba(85, 139, 47, 0.6)'); 
                        g.addColorStop(0.6, 'rgba(85, 139, 47, 0)'); 
                        ctx.fillStyle = g; ctx.fillRect(sx, sy, mw, mh);
                    }
                    ctx.restore();
                };









                // 2. HEIGHT SAFETY
                let rockFeetWorldY = (e.y + e.h) * TILE;
                let ceilingWorldY = 120 * TILE; 
                let maxHeadroom = Math.max(0, rockFeetWorldY - ceilingWorldY - 5); 

                // 3. FOAM BASE
                let time = Date.now() / 800;
                let foamSize = Math.sin(time + e.x) * 1.5;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                ctx.beginPath();
                ctx.ellipse(cx, cy - 3, w/2 * 0.8 + foamSize, 5, 0, 0, 6.28);
                ctx.fill();

                // HELPER: Shadow
                const drawShadow = (ox, width) => {
                    ctx.fillStyle = 'rgba(0, 0, 20, 0.3)';
                    ctx.beginPath();
                    ctx.ellipse(cx + ox, cy - 2, width/2, 4, 0, 0, 6.28);
                    ctx.fill();
                };

                // --- STYLE A: SHARP SLATE (Cool Colors) ---
                const drawSlate = (ox, oy, sw, sh, scaleH) => {
                    let maxAspectRatioH = sw * 2.2; 
                    let desiredH = Math.min(sh * scaleH, maxAspectRatioH);
                    let safeH = Math.min(desiredH, (maxHeadroom - oy) / 1.15);
                    let sx = cx + ox - (sw/2);
                    let sy = cy - oy - safeH;

                    ctx.beginPath();
                    ctx.moveTo(sx, sy + safeH); 
                    ctx.lineTo(sx - (sw*0.05), sy + safeH*0.3);
                    ctx.lineTo(sx + sw*0.2, sy); 
                    ctx.lineTo(sx + sw*0.5, sy + safeH*0.05); 
                    ctx.lineTo(sx + sw*0.8, sy - (safeH*0.1)); 
                    ctx.lineTo(sx + sw + (sw*0.05), sy + safeH*0.4); 
                    ctx.lineTo(sx + sw, sy + safeH); 
                    ctx.closePath();

                    let grad = ctx.createLinearGradient(sx, sy, sx, sy + safeH);
                    grad.addColorStop(0, '#78909c'); 
                    grad.addColorStop(1, '#263238'); 
                    ctx.fillStyle = grad; ctx.fill();


drawMoss(sx, sy, sw, safeH); // Apply Moss



                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.beginPath(); ctx.moveTo(sx + sw*0.2, sy); ctx.lineTo(sx + sw*0.5, sy + safeH*0.05); ctx.lineTo(sx + sw*0.5, sy + safeH); ctx.lineTo(sx + sw*0.1, sy + safeH*0.8); ctx.fill();
                    ctx.strokeStyle = '#102027'; ctx.lineWidth = 1; ctx.stroke();
                };

                // --- STYLE B: ROUND BOULDER (2 Colors: Grey / Brown) ---
                const drawRound = (ox, oy, sw, sh, scaleH, useBrown) => {
                    let maxAspectRatioH = sw * 0.85; 
                    let desiredH = Math.min(sh * scaleH, maxAspectRatioH);
                    let safeH = Math.min(desiredH, (maxHeadroom - oy) / 1.05);
                    let sx = cx + ox - (sw/2);
                    let sy = cy - oy - safeH;

                    ctx.beginPath();
                    ctx.moveTo(sx, sy + safeH);
                    ctx.bezierCurveTo(sx - 2, sy + safeH*0.5, sx + sw*0.2, sy, sx + sw*0.5, sy);
                    ctx.bezierCurveTo(sx + sw*0.9, sy, sx + sw + 2, sy + safeH*0.6, sx + sw, sy + safeH);
                    ctx.closePath();

                    let lightX = sx + sw * 0.4, lightY = sy + safeH * 0.2; 
                    let grad = ctx.createRadialGradient(lightX, lightY, sw * 0.2, lightX, lightY, sw * 1.2);
                    
                    if (useBrown) { 
                        grad.addColorStop(0, '#a1887f'); grad.addColorStop(1, '#4e342e'); 
                    } else { 
                        grad.addColorStop(0, '#bdbdbd'); grad.addColorStop(1, '#424242'); 
                    }
                    
                    ctx.fillStyle = grad; ctx.fill();



drawMoss(sx, sy, sw, safeH); // Apply Moss


                    ctx.fillStyle = 'rgba(0,0,0,0.15)'; 
                    ctx.beginPath(); ctx.arc(sx + sw * 0.7, sy + safeH * 0.4, 1.5, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.arc(sx + sw * 0.3, sy + safeH * 0.7, 1, 0, 6.28); ctx.fill();
                    ctx.strokeStyle = '#263238'; ctx.lineWidth = 1; ctx.stroke();
                };

                // --- STYLE C: GIGANTIC SPRAWLED REEF (2 Sizes, 2 Colors) ---
                const drawSprawled = (ox, oy, sw, sh, isMega, isDark) => {
                    // SIZE LOGIC: Mega is 20% wider and uses max height
                    let drawW = isMega ? sw * 1.2 : sw; 
                    let drawH = sh * 0.95; 
                    
                    let safeH = Math.min(drawH, (maxHeadroom - oy) / 1.05);
                    
                    let sx = cx + ox - (drawW/2);
                    let sy = cy - oy - safeH;

                    // Silhouette
                    ctx.beginPath();
                    ctx.moveTo(sx, sy + safeH);
                    // Tier 1
                    ctx.lineTo(sx - drawW*0.05, sy + safeH*0.6);
                    ctx.lineTo(sx + drawW*0.15, sy + safeH*0.5);
                    // Tier 2
                    ctx.lineTo(sx + drawW*0.25, sy + safeH*0.2);
                    // Peak
                    ctx.lineTo(sx + drawW*0.4, sy - safeH*0.05);
                    ctx.lineTo(sx + drawW*0.6, sy + safeH*0.1);
                    // Tier 2 Right
                    ctx.lineTo(sx + drawW*0.8, sy + safeH*0.3);
                    ctx.lineTo(sx + drawW + drawW*0.05, sy + safeH*0.6);
                    ctx.lineTo(sx + drawW, sy + safeH);
                    ctx.closePath();

                    // COLOR LOGIC: Slate Blue vs Dark Obsidian
                    ctx.fillStyle = isDark ? '#263238' : '#546e7a'; 
                    ctx.fill();


drawMoss(sx, sy, drawW, safeH); // Apply Moss




                    ctx.strokeStyle = '#102027'; ctx.lineWidth = 1; ctx.stroke();

                    // Shading (Matte)
                    ctx.save();
                    ctx.clip(); 
                    
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath(); 
                    ctx.moveTo(sx + drawW*0.25, sy + safeH*0.2); 
                    ctx.lineTo(sx + drawW*0.25, sy + safeH);     
                    ctx.lineTo(sx + drawW, sy + safeH);          
                    ctx.lineTo(sx + drawW, sy + safeH*0.6);      
                    ctx.fill();

                    // Cracks
                    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(sx + drawW*0.5, sy + safeH*0.5); ctx.lineTo(sx + drawW*0.55, sy + safeH*0.8); ctx.stroke();

                    // Barnacles
                    const drawBarnacle = (bx, by) => {
                        ctx.fillStyle = '#cfd8dc'; ctx.beginPath(); ctx.arc(bx, by, 1.5, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(bx, by, 0.5, 0, 6.28); ctx.fill();
                    };
                    drawBarnacle(sx + drawW*0.2, sy + safeH*0.55);
                    drawBarnacle(sx + drawW*0.25, sy + safeH*0.6);
                    if (isMega) drawBarnacle(sx + drawW*0.7, sy + safeH*0.4); // Extra detail for Mega

                    ctx.restore();
                };

                // --- 4. DRAW VARIANTS ---
                if (variant === 2) { 
                    // === GIGANTIC SPRAWL ===
                    drawShadow(0, w * 1.1); // Big shadow
                    
                    // Logic: Use varSeed to determine Sub-Variant
                    // Bit 1 (Value 1 or 0): Size (Mega vs Grand)
                    // Bit 2 (Value 2 or 0): Color (Dark vs Slate)
                    let isMega = (varSeed % 2 === 0);
                    let isDark = ((varSeed >> 1) % 2 === 0);

                    drawSprawled(0, 0, w * 0.9, h, isMega, isDark); 
                } 
                else if (variant === 1) { 
                    // === ROUND BOULDER ===
                    drawShadow(0, w*0.85);
                    // 50% Brown, 50% Grey
                    drawRound(0, 0, w*0.85, h, 1.0, (varSeed % 4 < 2)); 
                } 
                else { 
                    // === SHARP SLATE ===
                    drawShadow(0, w*0.8);
                    drawSlate(0, 0, w*0.8, h, 1.8); 
                }

                return;
            }




                // A. BOULDER (Unchanged)
                if (e.kind === 'boulder') {
                    let r = TILE - 12;
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath(); ctx.ellipse(cx, cy + 35, TILE-8, 6, 0, 0, 6.28); ctx.fill();

                    ctx.fillStyle = '#b0bec5'; 
                    ctx.beginPath(); ctx.ellipse(cx, cy+5, r, r-5, 0, 0, 6.28); ctx.fill();

                    ctx.fillStyle = '#78909c'; 
                    ctx.fillRect(cx-15, cy, 3, 3); ctx.fillRect(cx+10, cy-10, 4, 4);
                    ctx.fillRect(cx+5, cy+15, 3, 3); ctx.fillRect(cx-20, cy+10, 2, 2);
                    ctx.fillRect(cx+20, cy+5, 3, 3);
                    
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.beginPath(); ctx.ellipse(cx-10, cy-10, 8, 4, -0.5, 0, 6.28); ctx.fill();

                    ctx.strokeStyle = '#546e7a'; ctx.lineWidth = 2; ctx.stroke();
                }




                
                // B. STUMP (Fixed: Irregular "Gripping" Roots)
                if (e.kind === 'stump') {
                    let topY = y + 45; 
                    let botY = y + e.h*TILE - 12;
                    let topW = (e.w*TILE)/2 - 25; 
                    let botW = (e.w*TILE)/2 - 8; 

                    // 1. Root Shadow (Matches the irregular shape)
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.beginPath(); 
                    // Left blob, Right blob, Middle blob
                    ctx.ellipse(cx - 15, botY + 2, 10, 5, 0, 0, 6.28); 
                    ctx.ellipse(cx + 15, botY + 2, 10, 5, 0, 0, 6.28); 
                    ctx.fill();

                    // 2. Main Trunk
                    ctx.fillStyle = '#b0772c'; 
                    ctx.beginPath();
                    ctx.moveTo(cx - topW, topY); // Top Left
                    
                    // Left Side Flare
                    ctx.quadraticCurveTo(cx - topW - 5, (topY+botY)/2, cx - botW, botY + 2);
                    
                    // --- THE IRREGULAR BOTTOM ---
                    // Instead of a line, we draw "toes"
                    ctx.lineTo(cx - 10, botY - 3); // Indent up between roots
                    ctx.lineTo(cx, botY + 4);      // Middle root dipping down
                    ctx.lineTo(cx + 10, botY - 3); // Indent up
                    ctx.lineTo(cx + botW, botY + 2); // Right root end
                    // -----------------------------

                    // Right Side Flare
                    ctx.quadraticCurveTo(cx + topW + 5, (topY+botY)/2, cx + topW, topY);
                    ctx.closePath();
                    ctx.fill();
                    
                    // 3. Bark Shading (Depth)
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
                    ctx.beginPath();
                    ctx.moveTo(cx + 10, botY - 3); // Start at right indent
                    ctx.lineTo(cx + botW, botY + 2);
                    ctx.lineTo(cx + topW, topY);
                    ctx.lineTo(cx + 5, topY);
                    ctx.fill();

                    // 4. Bark Texture (Ridges)
                    ctx.fillStyle = '#8d5e20'; 
                    ctx.beginPath();
                    // Left ridge
                    ctx.moveTo(cx - 15, topY + 5); ctx.lineTo(cx - 18, botY - 2); ctx.lineTo(cx - 14, botY - 5); ctx.fill(); 
                    // Right ridge
                    ctx.moveTo(cx + 10, topY + 8); ctx.lineTo(cx + 14, botY - 2); ctx.lineTo(cx + 8, botY - 5); ctx.fill();

                    // 5. Cut Top
                    ctx.fillStyle = '#e6b89c'; 
                    ctx.beginPath(); ctx.ellipse(cx, topY, topW, 8, 0, 0, 6.28); ctx.fill();

                    // 6. Rings & Cracks
                    ctx.strokeStyle = '#c69c7e'; ctx.lineWidth = 1.5;
                    for(let i=1; i<=3; i++) {
                         ctx.beginPath(); ctx.ellipse(cx, topY, i*4, i*2, 0, 0, 6.28); ctx.stroke();
                    }
                    // Radial Crack
                    ctx.strokeStyle = '#8d5e20'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx - 8, topY - 3); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx + 5, topY + 4); ctx.stroke();
                    
                    // Heartwood
                    ctx.fillStyle = '#8d5e20';
                    ctx.beginPath(); ctx.arc(cx, topY, 1.5, 0, 6.28); ctx.fill();

                    // 7. Outline (Follows the wavy bottom)
                    ctx.strokeStyle = '#5d2e1f'; ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cx - topW, topY);
                    ctx.quadraticCurveTo(cx - topW - 5, (topY+botY)/2, cx - botW, botY + 2);
                    
                    // Trace bottom again for outline
                    ctx.lineTo(cx - 10, botY - 3); 
                    ctx.lineTo(cx, botY + 4);      
                    ctx.lineTo(cx + 10, botY - 3); 
                    ctx.lineTo(cx + botW, botY + 2); 

                    ctx.quadraticCurveTo(cx + topW + 5, (topY+botY)/2, cx + topW, topY);
                    ctx.stroke();
                }
            }
///////////////////////










//////////////////////
            // 3. TREES (The Updated Art)
            else if(e.type === 'env') {
                const C_1x1_MAIN='#4caf50'; const C_1x1_SHADOW='#1b5e20';
                const C_2x2_MAIN='#145A32'; const C_2x2_SHADOW='#003300';
                const C_APPLE_MAIN='#689f38'; const C_APPLE_SHADOW='#33691e';
                const C_TRUNK='#5d4037'; 

                const drawCloud = (cx, cy, s, color, shadowColor) => {
                    let puffs = [{x:0,y:0,r:1.0}, {x:-0.7,y:0.2,r:0.7}, {x:0.7,y:0.2,r:0.7}, {x:0,y:-0.6,r:0.8}];
                    ctx.fillStyle = shadowColor; puffs.forEach(p => { ctx.beginPath(); ctx.arc(cx + p.x*s, (cy + 2) + p.y*s, (p.r*s) + 2.5, 0, 6.28); ctx.fill(); });
                    ctx.fillStyle = color; puffs.forEach(p => { ctx.beginPath(); ctx.arc(cx + p.x*s, cy + p.y*s, p.r*s, 0, 6.28); ctx.fill(); });
                };




// --- NEW: COCONUT TREE ---
// --- COCONUT TREE (Chunky Style) ---
                // --- COCONUT TREE (High-Fidelity Palm) ---
                // --- NEW: COCONUT TREE (Fixed Colors & Variable Coconuts 1-3) ---
                if (e.kind === 'tree_coconut') {
                    // 1. DETERMINE VARIANT (0 to 9)
                    let variant = (Math.floor(e.x * 7) + Math.floor(e.y * 13)) % 10;

                    // 2. DEFINE THE 10 ARCHETYPES
                    let cfg = {};

                    switch(variant) {
                        case 0: // THE CLASSIC (Balanced, 3 Coconuts)
                            cfg = { h:-0.2, lean:0, thick:16, len:75, wid:35, nCoco: 3,
                                    c:{b:'#1b5e20', d:'#2e7d32', l:'#43a047'} }; break;
                        case 1: // THE GOLDEN LEANER (Right Lean, 2 Coconuts)
                            cfg = { h:0, lean:25, thick:15, len:80, wid:30, nCoco: 2,
                                    c:{b:'#33691e', d:'#827717', l:'#c0ca33'} }; break;
                        case 2: // THE DWARF (Short, Fat, Teal, 3 Coconuts)
                            cfg = { h:0.6, lean:-5, thick:24, len:60, wid:45, nCoco: 3,
                                    c:{b:'#004d40', d:'#00695c', l:'#26a69a'} }; break;
                        case 3: // THE SKYSCRAPER (Tall, Skinny, 1 Coconut)
                            cfg = { h:-0.6, lean:5, thick:12, len:70, wid:28, nCoco: 1,
                                    c:{b:'#33691e', d:'#558b2f', l:'#9ccc65'} }; break;
                        case 4: // THE WINDBLOWN (Hard Left, 1 Coconut)
                            cfg = { h:-0.1, lean:-30, thick:16, len:85, wid:32, nCoco: 1,
                                    c:{b:'#1b5e20', d:'#388e3c', l:'#66bb6a'} }; break;
                        case 5: // THE ANCIENT (Thick, Dark, 3 Coconuts)
                            cfg = { h:-0.3, lean:10, thick:26, len:90, wid:40, nCoco: 3,
                                    c:{b:'#000000', d:'#1b5e20', l:'#2e7d32'} }; break;
                        case 6: // THE BABY (Small, Fresh Green - FIXED COLOR, 1 Coconut)
                            cfg = { h:0.8, lean:0, thick:12, len:50, wid:25, nCoco: 1,
                                    c:{b:'#33691e', d:'#689f38', l:'#8bc34a'} }; break; // Removed Neon
                        case 7: // THE STARFISH (Spiky, 2 Coconuts)
                            cfg = { h:0.5, lean:0, thick:18, len:95, wid:20, nCoco: 2,
                                    c:{b:'#1b5e20', d:'#2e7d32', l:'#81c784'} }; break;
                        case 8: // THE YELLOW PALM (Autumn, 2 Coconuts)
                            cfg = { h:0, lean:15, thick:15, len:75, wid:35, nCoco: 2,
                                    c:{b:'#827717', d:'#afb42b', l:'#dce775'} }; break;
                        case 9: // THE MUTANT (Curved, Blue-Green, 3 Coconuts)
                            cfg = { h:-0.2, lean:-15, thick:20, len:80, wid:50, nCoco: 3,
                                    c:{b:'#006064', d:'#00838f', l:'#00acc1'} }; break;
                    }

                    // 3. ANIMATION
                    let time = Date.now();
                    let swaySpd = (cfg.h > 0) ? 1500 : 2500;
                    let swayMag = (cfg.h > 0) ? 5 : 12;
                    let sway = Math.sin(time / swaySpd) * swayMag; 
                    let leafBob = Math.sin(time / 800) * 3;

                    // 4. COORDINATES
                    let rootX = x + 1.5 * TILE;
                    let rootY = y + 2.8 * TILE;
                    
                    let topX = rootX + sway + cfg.lean; 
                    let topY = (y - 0.2 * TILE) + (cfg.h * TILE); 

                    // Curve trunk if leaning heavily
                    let curveOffset = (Math.abs(cfg.lean) > 20) ? -cfg.lean * 0.3 : 0;
                    let midX = (rootX + topX) / 2 + (sway * 0.2) + (cfg.lean * 0.3) + curveOffset;
                    let midY = (rootY + topY) / 2;

                    // 5. DRAW TRUNK
                    let numSegs = 8; 
                    const getTrunkPt = (t) => {
                        let inv = 1 - t;
                        return {
                            x: (inv*inv * rootX) + (2*inv*t * midX) + (t*t * topX),
                            y: (inv*inv * rootY) + (2*inv*t * midY) + (t*t * topY)
                        };
                    };

                    for (let i = 0; i < numSegs; i++) {
                        let t = i / numSegs;
                        let nextT = (i + 1) / numSegs;
                        let p1 = getTrunkPt(t);
                        let p2 = getTrunkPt(nextT);
                        let w1 = cfg.thick * (1 - t * 0.5);
                        let w2 = cfg.thick * (1 - nextT * 0.5);
                        let dx = p2.x - p1.x;
                        let dy = p2.y - p1.y;
                        let angle = Math.atan2(dy, dx) + Math.PI/2;
                        let len = Math.hypot(dx, dy) + 1;

                        ctx.save();
                        ctx.translate(p1.x, p1.y);
                        ctx.rotate(angle);
                        ctx.fillStyle = '#795548'; 
                        ctx.beginPath();
                        ctx.moveTo(-w1, 0); ctx.lineTo(w1, 0);
                        ctx.lineTo(w2, -len); ctx.lineTo(-w2, -len);
                        ctx.fill();
                        ctx.fillStyle = 'rgba(0,0,0,0.15)'; 
                        ctx.fillRect(0, -len, w2, len);
                        ctx.fillStyle = '#3e2723'; 
                        ctx.fillRect(-w1 + 1, -2, (w1*2)-2, 2);
                        ctx.restore();
                    }

                    // 6. DRAW LEAVES (Fronds)
                    const draw10VariantFrond = (angle, lenMod, widMod, color) => {
                        let len = cfg.len * lenMod;
                        let width = cfg.wid * widMod;

                        let tipX = topX + Math.cos(angle) * len + (sway * 0.5);
                        let tipY = topY + Math.sin(angle) * len + leafBob;
                        
                        if (angle > 0 && angle < 3.14) tipY += 20; 

                        let cpDist = len * 0.6;
                        let cpX = topX + Math.cos(angle - 0.2) * cpDist; 
                        let cpY = topY + Math.sin(angle - 0.2) * cpDist - 25; 

                        const getQ = (t, p0x, p0y, p1x, p1y, p2x, p2y) => {
                            let inv = 1 - t;
                            return {
                                x: (inv*inv * p0x) + (2*inv*t * p1x) + (t*t * p2x),
                                y: (inv*inv * p0y) + (2*inv*t * p1y) + (t*t * p2y)
                            };
                        }

                        ctx.fillStyle = color;
                        ctx.beginPath();
                        ctx.moveTo(topX, topY);
                        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY); // Smooth Top

                        // Jagged Bottom
                        let bCpX = cpX; let bCpY = cpY + width; 
                        let segments = 5; 
                        for(let i=1; i<=segments; i++) {
                            let t = i / segments; 
                            let pt = getQ(t, tipX, tipY, bCpX, bCpY, topX, topY + 8);
                            if (i % 2 !== 0 && i < segments) {
                                let midX = (pt.x + topX) / 2;
                                let midY = (pt.y + topY) / 2;
                                let notchX = pt.x + (midX - pt.x) * 0.25; 
                                let notchY = pt.y + (midY - pt.y) * 0.25;
                                ctx.lineTo(notchX, notchY);
                            } else {
                                ctx.lineTo(pt.x, pt.y);
                            }
                        }
                        ctx.closePath(); ctx.fill();

                        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                        ctx.lineWidth = 1; ctx.stroke();
                    };

                    // LAYER 1: BACK LEAVES
                    let backAngles = [0.4, 2.7, 3.8, 5.6];
                    backAngles.forEach(a => draw10VariantFrond(a, 0.9, 0.9, cfg.c.b));

                    // LAYER 2: COCONUTS (1-3 Logic)
                    // Determine positions based on count
                    let cocoPos = [];
                    if (cfg.nCoco === 1) {
                         cocoPos = [{x:0, y:12, s:8}]; // 1: Center
                    } else if (cfg.nCoco === 2) {
                         cocoPos = [{x:-5, y:9, s:7.5}, {x:5, y:9, s:7.5}]; // 2: Sides
                    } else {
                         cocoPos = [{x:-6, y:8, s:7}, {x:6, y:8, s:7}, {x:0, y:14, s:8}]; // 3: Full cluster
                    }

                    cocoPos.forEach(c => {
                        let cx = topX + c.x + (sway*0.1); 
                        let cy = topY + c.y;
                        
                        // Shadow
                        ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(cx+2, cy+2, c.s, 0, 6.28); ctx.fill();
                        // Main Body
                        ctx.fillStyle = '#c0ca33'; ctx.beginPath(); ctx.arc(cx, cy, c.s, 0, 6.28); ctx.fill();
                        // Shading
                        ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.beginPath(); ctx.arc(cx, cy, c.s, 2.5, 5.5); ctx.fill();
                    });

                    // LAYER 3: FRONT LEAVES
                    let frontAngles = [0, 1.2, 2.0, 3.14, 4.2, 5.2];
                    frontAngles.forEach(a => {
                        let col = (a > 3.5 && a < 5.8) ? cfg.c.l : cfg.c.d; 
                        draw10VariantFrond(a, 1.0, 1.0, col);
                    });

                    // 7. CENTER CAP
                    ctx.fillStyle = cfg.c.d;
                    ctx.beginPath(); ctx.arc(topX, topY + 2, 7, 0, 6.28); ctx.fill();

                    // 8. BASE GRASS TUFTS
                    ctx.fillStyle = '#2e7d32';
                    ctx.beginPath();
                    ctx.moveTo(rootX - 12, rootY);
                    ctx.lineTo(rootX - 16, rootY - 12); ctx.lineTo(rootX - 10, rootY - 4);
                    ctx.lineTo(rootX - 6, rootY - 18); ctx.lineTo(rootX - 2, rootY - 4);
                    ctx.lineTo(rootX + 2, rootY - 16); ctx.lineTo(rootX + 6, rootY - 4);
                    ctx.lineTo(rootX + 14, rootY - 10); ctx.lineTo(rootX + 10, rootY);
                    ctx.fill();

                    return; 
                }











                // --- 1. FRUIT TREES (Apple & Orange) ---
                if (e.kind === 'tree_apple' || e.kind === 'tree_orange') {
                    let trunkX = x + 1.5*TILE - 15;
                    let trunkY = y + 2.0*TILE; 
                    
                    // Trunk
                    const C_APPLE_MAIN='#689f38'; const C_APPLE_SHADOW='#33691e'; const C_TRUNK='#5d4037';
                    ctx.fillStyle = C_APPLE_SHADOW; ctx.fillRect(trunkX - 2, trunkY - 2, 34, TILE + 2);
                    ctx.fillStyle = C_TRUNK; ctx.fillRect(trunkX, trunkY, 30, TILE);

                    // Canopy
                    drawCloud(x + 1.0*TILE, y + 1.5*TILE, 35, C_APPLE_MAIN, C_APPLE_SHADOW); 
                    drawCloud(x + 2.0*TILE, y + 1.5*TILE, 35, C_APPLE_MAIN, C_APPLE_SHADOW); 
                    drawCloud(x + 1.5*TILE, y + 1.0*TILE, 38, C_APPLE_MAIN, C_APPLE_SHADOW); 

                    // FRUIT DRAWING
                    let has = e.apples || [true, true, true];
                    let isOrange = (e.kind === 'tree_orange');
                    
                    // Choose Colors based on tree type
                    let colMain = isOrange ? '#ff9800' : '#f44336'; // Orange vs Red
                    let colShad = isOrange ? '#e65100' : '#b71c1c'; // Dark Orange vs Dark Red

                    const drawFruit = (ax, ay) => { 
                        // Stem
                        ctx.fillStyle = '#3e2723'; ctx.fillRect(ax - 1, ay - 10, 2, 5);
                        // Leaf
                        ctx.fillStyle = '#8bc34a'; ctx.beginPath(); 
                        ctx.ellipse(ax + 3, ay - 9, 3, 1.5, 0.5, 0, 6.28); ctx.fill();
                        // Shadow
                        ctx.fillStyle = colShad; ctx.beginPath(); ctx.arc(ax, ay + 1, 7.5, 0, 6.28); ctx.fill();
                        // Body
                        ctx.fillStyle = colMain; ctx.beginPath(); ctx.arc(ax, ay, 7, 0, 6.28); ctx.fill();
                        // Shine
                        ctx.beginPath(); ctx.arc(ax - 2, ay - 2, 2, 0, 6.28); ctx.fill();
                    };

                    if (has[0]) drawFruit(x + 0.8*TILE, y + 1.4*TILE);
                    if (has[1]) drawFruit(x + 2.2*TILE, y + 1.5*TILE);
                    if (has[2]) drawFruit(x + 1.5*TILE, y + 0.8*TILE);
                }




                else if (e.kind === 'tree_2x2' || e.kind === 'tree_big') {
                    ctx.fillStyle = C_2x2_SHADOW; ctx.fillRect(x + TILE - 12, y + 1.5*TILE, 24, 32);
                    ctx.fillStyle = C_TRUNK; ctx.fillRect(x + TILE - 10, y + 1.5*TILE, 20, 30);
                    drawCloud(x + TILE, y + 1.2*TILE, 35, C_2x2_MAIN, C_2x2_SHADOW);
                    drawCloud(x + TILE, y + 0.8*TILE, 30, C_2x2_MAIN, C_2x2_SHADOW);
                } 
                else {
                    ctx.fillStyle = C_1x1_SHADOW; ctx.fillRect(x + 15, y + 30, 20, 22);
                    ctx.fillStyle = C_TRUNK; ctx.fillRect(x + 17, y + 30, 16, 20);
                    drawCloud(x + 25, y + 20, 22, C_1x1_MAIN, C_1x1_SHADOW);
                }
            }









// 5. CROPS (Moved to Layer 2 for Z-Sorting)
            else if (e.type === 'crop') {
                let cx = x + 25; 
                let cy = y + 35; // Bottom anchor for sorting

                const shadow = (w) => {
                    ctx.fillStyle = 'rgba(0,0,0,0.4)';
                    ctx.beginPath(); ctx.ellipse(cx, cy+2, w, w/3, 0, 0, 6.28); ctx.fill();
                };

                // STAGE 1: SPROUT
                if(e.stage === 1) { 
                    shadow(8);
                    ctx.fillStyle = '#76ff03'; 
                    ctx.fillRect(cx - 1, cy - 5, 2, 5);
                    ctx.beginPath(); ctx.ellipse(cx - 4, cy - 8, 4, 2, -0.6, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.ellipse(cx + 4, cy - 8, 4, 2, 0.6, 0, 6.28); ctx.fill();
                }
                
                // STAGE 2: GROWING
                else if(e.stage === 2) { 
                    shadow(12);
                    ctx.fillStyle = '#2e7d32'; 
                    ctx.beginPath(); ctx.arc(cx, cy-5, 12, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#4caf50'; 
                    ctx.beginPath(); ctx.arc(cx-4, cy-10, 6, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx+4, cy-8, 5, 0, 6.28); ctx.fill();
                }

                // STAGE 3: HARVEST READY
                else if(e.stage === 3) { 
                    let type = e.kind;

                    // 1. POTATO
                    if (type === 'potato') {
                        shadow(20);
                        const bigSpud = (ox, oy, w, h, col) => {
                            ctx.fillStyle = col; 
                            ctx.beginPath(); ctx.ellipse(cx+ox, cy+oy, w, h, 0, 0, 6.28); ctx.fill();
                            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(cx+ox-2, cy+oy-1, 2, 2);
                            ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth=1; ctx.stroke();
                        };
                        bigSpud(-7, -5, 11, 9, '#8d6e63'); 
                        bigSpud(7, -3, 11, 8, '#a1887f');  
                        bigSpud(0, 4, 13, 10, '#d7ccc8');  
                    }
                    // 2. CARROT
                    else if (type === 'carrot') {
                        shadow(18); 
                        ctx.fillStyle = '#1b5e20'; 
                        ctx.beginPath(); ctx.moveTo(cx, cy-20); ctx.lineTo(cx-20, cy-50); ctx.lineTo(cx-6, cy-20); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx, cy-20); ctx.lineTo(cx+20, cy-50); ctx.lineTo(cx+6, cy-20); ctx.fill();
                        ctx.lineWidth = 5; ctx.strokeStyle = '#43a047'; ctx.beginPath(); ctx.moveTo(cx, cy-20); ctx.lineTo(cx, cy-55); ctx.stroke();
                        ctx.fillStyle = '#ff6d00'; 
                        ctx.beginPath(); ctx.moveTo(cx - 16, cy - 20); ctx.lineTo(cx + 16, cy - 20); 
                        ctx.quadraticCurveTo(cx + 10, cy + 5, cx, cy + 10); ctx.quadraticCurveTo(cx - 10, cy + 5, cx - 16, cy - 20); ctx.fill();
                        ctx.fillStyle = '#e65100'; ctx.beginPath(); ctx.ellipse(cx, cy-20, 16, 5, 0, 0, 6.28); ctx.fill();
                        ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(cx-14, cy-12, 28, 2); ctx.fillRect(cx-12, cy-4, 24, 2); ctx.fillRect(cx-8, cy+2, 16, 2);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.beginPath(); ctx.ellipse(cx-8, cy-8, 4, 10, 0.2, 0, 6.28); ctx.fill();
                    }
                    // 3. TOMATO
                    else if (type === 'tomato') {
                        shadow(14);
                        ctx.fillStyle = '#1b5e20'; ctx.beginPath(); ctx.arc(cx, cy-10, 16, 0, 6.28); ctx.fill();
                        const drawTom = (ox, oy, r) => {
                            ctx.fillStyle = '#d50000'; ctx.beginPath(); ctx.arc(cx+ox, cy+oy, r, 0, 6.28); ctx.fill();
                            ctx.fillStyle = '#ff8a80'; ctx.beginPath(); ctx.arc(cx+ox-r/3, cy+oy-r/3, r/4, 0, 6.28); ctx.fill();
                            ctx.fillStyle = '#76ff03'; ctx.beginPath(); ctx.moveTo(cx+ox, cy+oy-r); ctx.lineTo(cx+ox-2, cy+oy-r-3); ctx.lineTo(cx+ox+2, cy+oy-r-3); ctx.fill();
                        };
                        drawTom(-8, -8, 7); drawTom(8, -10, 7); drawTom(0, -18, 9);
                    }
                    // 4. ROSE
                    else if (type === 'rose') {
                        shadow(8);
                        ctx.fillStyle = '#1b5e20'; ctx.fillRect(cx-2, cy-35, 4, 35); 
                        ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.ellipse(cx-6, cy-25, 6, 3, -0.5, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx+6, cy-20, 6, 3, 0.5, 0, 6.28); ctx.fill();  
                        let fy = cy-30;
                        ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.arc(cx, fy, 11, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#d50000'; ctx.beginPath(); ctx.arc(cx-2, fy-2, 8, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(cx+1, fy+1, 5, 0, 6.28); ctx.fill();
                        ctx.strokeStyle = '#880e4f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, fy, 4, 0, 6.28); ctx.stroke();
                    }
                    // 5. LAVENDER
                    else if (type === 'lavender') {
                        shadow(10);
                        ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.ellipse(cx, cy, 10, 6, 0, 0, 6.28); ctx.fill();
                        const stalk = (ox, h, tilt) => {
                            ctx.save(); ctx.translate(cx+ox, cy-5); ctx.rotate(tilt);
                            ctx.fillStyle = '#558b2f'; ctx.fillRect(-1, -h, 2, h);
                            ctx.fillStyle = '#7c4dff'; 
                            for(let i=0; i<6; i++) { ctx.beginPath(); ctx.ellipse(0, -h + (i*3), 3, 2, 0, 0, 6.28); ctx.fill(); }
                            ctx.restore();
                        };
                        stalk(-6, 25, -0.3); stalk(6, 25, 0.3); stalk(0, 30, 0);
                    }
                    // 6. CORN
                    else if (type === 'corn') {
                        shadow(10);
                        ctx.fillStyle = '#558b2f'; ctx.beginPath(); ctx.ellipse(cx-8, cy-15, 10, 4, 0.8, 0, 6.28); ctx.fill();
                        ctx.beginPath(); ctx.ellipse(cx+8, cy-15, 10, 4, -0.8, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#ffc107'; ctx.beginPath(); ctx.ellipse(cx, cy-25, 8, 16, 0, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#ff6f00'; ctx.fillRect(cx-2, cy-30, 4, 2); ctx.fillRect(cx-2, cy-25, 4, 2); ctx.fillRect(cx-2, cy-20, 4, 2);
                    }
                    // 7. SUNFLOWER
                    else if (type === 'sunflower') {
                        shadow(10);
                        ctx.fillStyle = '#33691e'; ctx.fillRect(cx-2, cy-35, 4, 35);
                        let fy = cy-35;
                        ctx.fillStyle = '#ffeb3b'; 
                        for(let i=0; i<10; i++) {
                            let a = (i*36)*Math.PI/180;
                            ctx.beginPath(); ctx.arc(cx+Math.cos(a)*12, fy+Math.sin(a)*12, 5, 0, 6.28); ctx.fill();
                        }
                        ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(cx, fy, 9, 0, 6.28); ctx.fill();
                    }
                    // 8. TULIP
                    else if (type === 'tulip') {
                        shadow(8);
                        ctx.fillStyle = '#2e7d32'; ctx.fillRect(cx-2, cy-25, 4, 25);
                        ctx.fillStyle = '#4caf50'; 
                        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx-12, cy-15, cx-6, cy-30); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx+12, cy-15, cx+6, cy-30); ctx.fill();
                        let fy = cy-30;
                        ctx.fillStyle = '#f50057'; ctx.beginPath(); ctx.arc(cx, fy, 11, 0, Math.PI, false); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx-11, fy); ctx.lineTo(cx-5, fy-10); ctx.lineTo(cx, fy); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx+11, fy); ctx.lineTo(cx+5, fy-10); ctx.lineTo(cx, fy); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx, fy); ctx.lineTo(cx, fy-8); ctx.lineTo(cx, fy); ctx.stroke();
                    }
                }
            }








// 4. DECORATIONS (Moved to Entity Layer)
            else if(e.type === 'struct_item') {
                let sid = e.kind;
                let px = x; // Use entity screen coordinates
                let py = y; 
                let lift = 25; 
                let topY = py - lift;
                let bodyH = TILE + lift - 5;
                
                let key = e.key; 

                // === WOOD ===
                if (sid === 'wood') {
                     ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(px + 4, py + TILE - 8, TILE - 8, 8);
                     ctx.fillStyle = '#5d3a22'; ctx.fillRect(px, topY + 10, TILE, bodyH - 10);
                     ctx.fillStyle = '#8d4e25'; ctx.fillRect(px, topY + 10, TILE - 4, bodyH - 10);
                     ctx.fillStyle = '#a05a2c'; ctx.fillRect(px, topY + 10, TILE - 12, bodyH - 10);
                     ctx.fillStyle = 'rgba(62, 39, 35, 0.4)'; ctx.fillRect(px + 6, topY + 10, 3, bodyH - 10); ctx.fillRect(px + 20, topY + 15, 4, bodyH - 15);
                     ctx.fillStyle = '#e0c0a0'; ctx.beginPath(); ctx.roundRect(px, topY, TILE, TILE - 15, 12); ctx.fill();
                     ctx.strokeStyle = '#a05a2c'; ctx.lineWidth = 2;
                     ctx.beginPath(); ctx.ellipse(px + 25, topY + 18, 18, 10, 0, 0, 6.28); ctx.stroke();
                     ctx.beginPath(); ctx.ellipse(px + 25, topY + 18, 8, 5, 0, 0, 6.28); ctx.stroke();
                     ctx.fillStyle = '#fff3e0'; ctx.beginPath(); ctx.arc(px + 25, topY + 18, 2, 0, 6.28); ctx.fill();
                     ctx.strokeStyle = '#fff3e0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(px+2, topY+2, TILE-4, TILE-19, 12); ctx.stroke();
                } 
                
                // === BRICK ===
                else if (sid === 'brick') {
                     ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(px, py + TILE - 6, TILE, 6);
                     ctx.fillStyle = '#b71c1c'; ctx.fillRect(px, topY + 10, TILE, bodyH - 10);
                     ctx.fillStyle = 'rgba(0,0,0,0.3)';
                     let startY = topY + 10;
                     for(let i=0; i<4; i++) ctx.fillRect(px, startY + 12 + (i*14), TILE, 2);
                     ctx.fillRect(px + 25, startY, 2, 12); ctx.fillRect(px + 12, startY + 14, 2, 12);
                     ctx.fillRect(px + 37, startY + 14, 2, 12); ctx.fillRect(px + 25, startY + 28, 2, 12);
                     ctx.fillRect(px + 12, startY + 42, 2, 12); ctx.fillRect(px + 37, startY + 42, 2, 12);
                     ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(px, startY, 4, bodyH - 10);
                     ctx.fillStyle = '#ef5350'; ctx.fillRect(px, topY, TILE, TILE);
                     ctx.fillStyle = '#e57373'; 
                     const drawStud = (sx, sy) => { ctx.fillStyle = '#c62828'; ctx.fillRect(sx+2, sy+2, 10, 10); ctx.fillStyle = '#ff8a80'; ctx.fillRect(sx, sy, 10, 10); };
                     drawStud(px + 8, topY + 8); drawStud(px + 32, topY + 8); drawStud(px + 8, topY + 32); drawStud(px + 32, topY + 32);
                     ctx.strokeStyle = '#c62828'; ctx.lineWidth = 1; ctx.strokeRect(px, topY, TILE, TILE);
                }

                // === LETTER BRICK ===
                else if (sid === 'letter_brick') {
                    let data = S.farm.letterData[key] || { char: 'A', col: 0 };
                    let c = BRICK_COLS[data.col] || '#f5f5f5';
                    let lift = 18; let totalH = TILE + 5; 
                    let groundY = py + TILE; let topFaceY = groundY - TILE - 5; 
                    ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(px+1, topFaceY + lift, TILE-2, TILE - lift, 8); ctx.fill();
                    let gradB = ctx.createLinearGradient(px, topFaceY + lift, px, groundY);
                    gradB.addColorStop(0, 'rgba(0,0,0,0.1)'); gradB.addColorStop(1, 'rgba(0,0,0,0.3)');
                    ctx.fillStyle = gradB; ctx.fill();
                    ctx.strokeStyle = 'rgba(0,0,0,0.3)'; ctx.lineWidth = 1; ctx.stroke();
                    ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(px, topFaceY, TILE, TILE - lift + 2, 8); ctx.fill();
                    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 2; ctx.stroke();
                    let gradH = ctx.createLinearGradient(px, topFaceY, px + TILE, topFaceY + TILE - lift);
                    gradH.addColorStop(0.0, 'rgba(255,255,255,0.4)'); gradH.addColorStop(0.5, 'rgba(255,255,255,0.0)');
                    ctx.fillStyle = gradH; ctx.fill();
                    ctx.fillStyle = (data.col === 5) ? '#fff' : 'rgba(0,0,0,0.75)';
                    ctx.font = "bold 28px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
                    ctx.fillText(data.char, px + TILE/2, topFaceY + (TILE - lift)/2 + 2);
                    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
                }

                // === STAR ===
                else if (sid === 'star') {
                    let tick = Date.now() / 250; let bob = Math.sin(tick) * 5; 
                    let cx = px + 25; let cy = py + 25 + bob; 
                    let shadSize = 12 - (bob * 0.4); 
                    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.beginPath(); ctx.ellipse(px + 25, py + 45, shadSize, 4, 0, 0, 6.28); ctx.fill();
                    ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.sin(tick) * 0.1); 
                    let spikes = 5, outer = 18, inner = 8;
                    ctx.beginPath();
                    for(let i=0; i<spikes*2; i++){
                        let r = (i%2===0)?outer:inner; let a = (i*Math.PI)/spikes - (Math.PI/2); 
                        ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r);
                    }
                    ctx.closePath();
                    ctx.fillStyle = '#ffeb3b'; ctx.fill(); ctx.strokeStyle = '#fbc02d'; ctx.lineWidth = 3; ctx.stroke();
                    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-6, -6, 4, 2, -0.5, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.ellipse(-4, 1, 1.5, 3.5, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(4, 1, 1.5, 3.5, 0, 0, 6.28); ctx.fill();  
                    ctx.fillStyle = '#fff'; ctx.fillRect(-4.5, -1, 1, 1); ctx.fillRect(3.5, -1, 1, 1);
                    ctx.fillStyle = 'rgba(255, 64, 129, 0.5)'; ctx.beginPath(); ctx.ellipse(-9, 4, 2.5, 1.5, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(9, 4, 2.5, 1.5, 0, 0, 6.28); ctx.fill();
                    ctx.restore();
                }

                // === BALLOONS ===
                else if (sid.startsWith('bal')) {
                    let tick = Date.now() / 400; let sway = Math.sin(tick) * 5; 
                    ctx.strokeStyle = '#eee'; ctx.lineWidth = 1;
                    ctx.beginPath(); ctx.moveTo(px + 25, py + 45); ctx.quadraticCurveTo(px + 25, py + 35, px + 25 + sway, py + 20); ctx.stroke();
                    let col = '#ef5350'; 
                    if(sid === 'bal_y') col = '#fdd835'; if(sid === 'bal_b') col = '#42a5f5';
                    ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(px + 25 + sway, py + 15, 13, 16, sway * 0.05, 0, 6.28); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.ellipse(px + 20 + sway, py + 10, 4, 6, -0.2, 0, 6.28); ctx.fill();
                    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(px + 25 + sway, py + 31, 2, 0, 6.28); ctx.fill();
                }

                // === TEDDY ===
                else if (sid === 'teddy') {
                    let cx = px + 25, cy = py + 30;
                    ctx.fillStyle = '#8d6e63'; ctx.beginPath(); ctx.ellipse(cx - 12, cy + 12, 6, 5, 0.2, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(cx + 12, cy + 12, 6, 5, -0.2, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.ellipse(cx, cy + 5, 14, 12, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#d7ccc8'; ctx.beginPath(); ctx.ellipse(cx, cy + 6, 8, 7, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#a1887f'; ctx.beginPath(); ctx.arc(cx, cy - 12, 13, 0, 6.28); ctx.fill();
                    ctx.beginPath(); ctx.arc(cx - 11, cy - 20, 5, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 11, cy - 20, 5, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.arc(cx - 11, cy - 20, 2, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 11, cy - 20, 2, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#d7ccc8'; ctx.beginPath(); ctx.ellipse(cx, cy - 9, 6, 4, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.ellipse(cx, cy - 10, 2.5, 1.5, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(cx - 4, cy - 14, 1.5, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.arc(cx + 4, cy - 14, 1.5, 0, 6.28); ctx.fill();
                }

                // === QBOX ===
                else if (sid === 'qbox') {
                    let bob = Math.sin(Date.now() / 200) * 2; let by = py + TILE - 38 + bob; 
                    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(px + 25, py + 40, 14, 4, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#f39c12'; ctx.fillRect(px + 8, by, 34, 34); 
                    ctx.fillStyle = '#f1c40f'; ctx.fillRect(px + 8, by, 34, 4); ctx.fillRect(px + 8, by, 4, 34); 
                    ctx.fillStyle = '#d35400'; ctx.fillRect(px + 8, by + 30, 34, 4); ctx.fillRect(px + 38, by, 4, 34); 
                    ctx.fillStyle = '#d35400'; ctx.fillRect(px + 10, by + 2, 4, 4); ctx.fillRect(px + 36, by + 2, 4, 4); ctx.fillRect(px + 10, by + 28, 4, 4); ctx.fillRect(px + 36, by + 28, 4, 4);
                    let flash = Math.floor(Date.now() / 500) % 2 === 0;
                    ctx.fillStyle = flash ? '#7f0000' : '#fff'; ctx.font = "bold 22px monospace"; ctx.textAlign = "center"; ctx.fillText("?", px + 25, by + 25); ctx.textAlign = "left"; 
                }

                // === COIN ===
                else if (sid === 'coin') {
                    let cx = px + TILE/2; let cy = py + TILE/2 - 5;
                    let spin = Math.sin(Date.now() / 150); let w = Math.abs(spin) * 16; 
                    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx, cy + 18, 10, 3, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#b7950b'; ctx.beginPath(); ctx.ellipse(cx, cy, w, 18, 0, 0, 6.28); ctx.fill();
                    ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.ellipse(cx - (spin * 2), cy, w * 0.85, 16, 0, 0, 6.28); ctx.fill();
                    if (w > 10) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx - (spin * 5), cy - 8, 3, 6, 0.2, 0, 6.28); ctx.fill(); }
                }

                // === EGG ===
                else if (sid === 'egg') {
                    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(px + TILE/2, py + TILE/2 + 5, 8, 10, 0, 0, 6.28); ctx.fill();
                    ctx.strokeStyle = '#eee'; ctx.lineWidth = 1; ctx.stroke();
                }

                // === LOGIC 1: FLOWERS (Pixel Art Reuse) ===
                else if (['rose','sunflower','tulip','lavender'].includes(sid)) {
                    let cx = px + 25; 
                    let cy = py + 35; // Bottom anchor

                    // Shadow base
                    ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
                    ctx.beginPath(); ctx.ellipse(cx, cy+2, 10, 4, 0, 0, 6.28); ctx.fill();

                    // A. ROSE
                    if (sid === 'rose') {
                        ctx.fillStyle = '#1b5e20'; ctx.fillRect(cx-2, cy-35, 4, 35); 
                        ctx.fillStyle = '#2e7d32'; 
                        ctx.beginPath(); ctx.ellipse(cx-6, cy-25, 6, 3, -0.5, 0, 6.28); ctx.fill(); 
                        ctx.beginPath(); ctx.ellipse(cx+6, cy-20, 6, 3, 0.5, 0, 6.28); ctx.fill();  
                        let fy = cy-30;
                        ctx.fillStyle = '#b71c1c'; ctx.beginPath(); ctx.arc(cx, fy, 11, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#d50000'; ctx.beginPath(); ctx.arc(cx-2, fy-2, 8, 0, 6.28); ctx.fill();
                        ctx.fillStyle = '#ff1744'; ctx.beginPath(); ctx.arc(cx+1, fy+1, 5, 0, 6.28); ctx.fill();
                        ctx.strokeStyle = '#880e4f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, fy, 4, 0, 6.28); ctx.stroke();
                    }
                    // B. SUNFLOWER
                    else if (sid === 'sunflower') {
                        ctx.fillStyle = '#33691e'; ctx.fillRect(cx-2, cy-35, 4, 35);
                        let fy = cy-35;
                        ctx.fillStyle = '#ffeb3b'; 
                        for(let i=0; i<10; i++) {
                            let a = (i*36)*Math.PI/180;
                            ctx.beginPath(); ctx.arc(cx+Math.cos(a)*12, fy+Math.sin(a)*12, 5, 0, 6.28); ctx.fill();
                        }
                        ctx.fillStyle = '#3e2723'; ctx.beginPath(); ctx.arc(cx, fy, 9, 0, 6.28); ctx.fill();
                    }
                    // C. TULIP
                    else if (sid === 'tulip') {
                        ctx.fillStyle = '#2e7d32'; ctx.fillRect(cx-2, cy-25, 4, 25);
                        ctx.fillStyle = '#4caf50'; 
                        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx-12, cy-15, cx-6, cy-30); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cx+12, cy-15, cx+6, cy-30); ctx.fill();
                        let fy = cy-30;
                        ctx.fillStyle = '#f50057'; ctx.beginPath(); ctx.arc(cx, fy, 11, 0, Math.PI, false); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx-11, fy); ctx.lineTo(cx-5, fy-10); ctx.lineTo(cx, fy); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx+11, fy); ctx.lineTo(cx+5, fy-10); ctx.lineTo(cx, fy); ctx.fill();
                        ctx.beginPath(); ctx.moveTo(cx, fy); ctx.lineTo(cx, fy-8); ctx.lineTo(cx, fy); ctx.stroke();
                    }
                    // D. LAVENDER
                    else if (sid === 'lavender') {
                        ctx.fillStyle = '#2e7d32'; ctx.beginPath(); ctx.ellipse(cx, cy, 10, 6, 0, 0, 6.28); ctx.fill();
                        // Helper for Stalks
                        const stalk = (ox, h, tilt) => {
                            ctx.save(); ctx.translate(cx+ox, cy-5); ctx.rotate(tilt);
                            ctx.fillStyle = '#558b2f'; ctx.fillRect(-1, -h, 2, h);
                            ctx.fillStyle = '#7c4dff'; 
                            for(let i=0; i<6; i++) { ctx.beginPath(); ctx.ellipse(0, -h + (i*3), 3, 2, 0, 0, 6.28); ctx.fill(); }
                            ctx.restore();
                        };
                        stalk(-6, 25, -0.3); stalk(6, 25, 0.3); stalk(0, 30, 0);
                    }
                }

                // === LOGIC 2: ALL OTHER GOODS (Floating Icons) ===
                else {
                    // Check if this ID exists in the "GOODS" tab (Tab 1)
                    let itemDef = BAG_CATS[1].find(i => i.id === sid);
                    if (itemDef) {
                        let bob = Math.sin(Date.now() / 200) * 3;
                        let cx = px + TILE/2;
                        let cy = py + TILE/2;

                        // 1. Shadow (Grounding)
                        ctx.fillStyle = 'rgba(0,0,0,0.2)';
                        ctx.beginPath(); ctx.ellipse(cx, cy + 15, 10, 4, 0, 0, 6.28); ctx.fill();

                        // 2. The Icon (Bouncing)
                        ctx.font = "30px serif"; 
                        ctx.textAlign = "center"; 
                        ctx.textBaseline = "middle";
                        ctx.fillStyle = "#fff"; // Default color won't affect emoji usually
                        // Draw Icon
                        ctx.fillText(itemDef.icon, cx, cy + bob);
                        
                        // Reset defaults
                        ctx.textAlign = "left"; 
                        ctx.textBaseline = "alphabetic";
                    }
                }
            }










        });

        // --- LAYER 3: PARTICLES & TIME ---
        S.parts.forEach(p => {
            p.x+=p.vx; p.y+=p.vy; p.life--;






// --- DOLPHIN RENDERER ---
// --- DOLPHIN RENDERER (Region-Specific Ghost Fix) ---
// --- DOLPHIN RENDERER (Clipping Mask Fix) ---
if (p.type === 'dolphin') {
   p.vy += p.grav; 

   // 1. EXTENDED DEATH CHECK (Allow full submerge)
   // We let it fall a full tile (+1.0) deep.
   // Because of the clipping mask below, it won't be visible "over" the water.
   // It will invisible slide into the water, and we delete it once fully hidden.
   if (p.y > p.startY + 1.0) {
       p.dead = true; 
       
       // Splash Effect
       S.audio.play('water'); 
       for(let k=0; k<20; k++) S.parts.push({
            x: p.x + (Math.random()-0.5)*0.5, 
            y: p.y - 0.5, // Spawn splash at surface, not deep down
            vx: (Math.random()-0.5)*0.15, 
            vy: -(Math.random()*0.15),
            c: Math.random() < 0.5 ? '#b3e5fc' : '#ffffff',
            life: 30 + Math.random() * 20, 
            s: 4
       });
       return; 
   }

   // 2. NIGHT/REGION FIX
   let t = S.farm.time;
   let isNight = (t >= 900 || t < 360);
   if (isNight) {
       let inRiver = (p.x >= 115 && p.x <= 175 && p.y >= 110 && p.y <= 130);
       let inCove  = (p.x >= 195 && p.x <= 300);
       if (inRiver || inCove) return;
   }

   // 3. DRAW WITH CLIPPING MASK
   let dx = p.x * TILE - S.cam.x + sx;
   let dy = p.y * TILE - S.cam.y;
   let rot = Math.atan2(p.vy, Math.abs(p.vx) * 0.5);

   ctx.save();

   // --- THE FIX IS HERE ---
   // Calculate the screen Y coordinate of the water surface
   let waterScreenY = p.startY * TILE - S.cam.y;
   
   // Define a clipping path that covers only the AIR (Top of screen down to water line)
   // Any part of the dolphin that falls below 'waterScreenY' will be hidden
   ctx.beginPath();
   ctx.rect(0, 0, cvs.width, waterScreenY);
   ctx.clip(); 
   // -----------------------

   ctx.translate(dx, dy);
   ctx.scale(p.dir * 3.0, 3.0); 
   ctx.rotate(rot);

   // -- Standard Body Art --
   ctx.fillStyle = '#78909c';
   ctx.beginPath();
   ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-5, -14, 8, -10); 
   ctx.quadraticCurveTo(14, -9, 14, -2); ctx.lineTo(22, 0); 
   ctx.lineTo(15, 3); ctx.quadraticCurveTo(0, 10, -20, 0);
   ctx.fill();

   ctx.fillStyle = '#eceff1'; // Belly
   ctx.beginPath();
   ctx.moveTo(15, 3); ctx.quadraticCurveTo(5, 7, -12, 1); 
   ctx.lineTo(15, 3);
   ctx.fill();

   ctx.fillStyle = '#546e7a'; // Fins
   ctx.beginPath(); ctx.moveTo(-2, -11); ctx.quadraticCurveTo(1, -20, 6, -10); ctx.fill();
   ctx.beginPath(); ctx.ellipse(7, 3, 5, 2, 0.6, 0, 6.28); ctx.fill();

   ctx.beginPath(); // Tail
   ctx.moveTo(-18, 0); ctx.lineTo(-26, -6); ctx.lineTo(-22, 0);  
   ctx.lineTo(-26, 6); ctx.lineTo(-18, 0);
   ctx.fill();

   ctx.fillStyle = '#37474f'; // Face
   ctx.fillRect(16, 2, 4, 1); 
   ctx.beginPath(); ctx.arc(13, -2, 1, 0, 6.28); ctx.fill(); 

   ctx.restore(); // Removes the clip for the next particle
   return;
}       // ------------------------






// --- SPRINKLE GLITCH FIX ---
            // === FIX: COVE MASK FOR PARTICLES ===
            // ===============================================
            // Check if this is a water/splash particle
            let isWater = (p.c === '#b3e5fc' || p.c === '#00b0ff' || p.c === '#ffffff');

            if (isWater) {
                // 1. Define Cove Range
                if (p.x >= 222 && p.x <= 273) {
                    // 2. Solve the Curve Math (Matches Map Logic)
                    let relX = p.x - 222;
                    const p1x=12, p2x=39, p3x=51;
                    let t = relX / 51.0; 
                    for(let i=0; i<4; i++) { 
                        let inv = 1-t;
                        let bx = (3*inv*inv*t * p1x) + (3*inv*t*t * p2x) + (t*t*t * p3x);
                        let slope = (3*inv*inv * p1x) + (6*inv*t * (p2x-p1x)) + (3*t*t * (p3x-p2x));
                        if (Math.abs(slope) > 0.001) t -= (bx - relX) / slope;
                    }
                    let inv = 1-t;
                    let curveY = 120 - ((3*inv*inv*t * 7.0) + (3*inv*t*t * 7.0));
                    
                    // 3. THE CHECK:
                    // If particle is HIGHER (smaller Y) than the curve, hide it!
                    // We add a tiny buffer (+0.2) so it doesn't clip too harshly
                    if (p.y < curveY + 0.2) return; 
                }
            }
            // ===============================================


            // --- SPRINKLE GLITCH FIX (Existing Night Logic) ---
            // 1. Identify Water Particles
            // let isWater ... (Already defined above)
            
            // 2. Check Time & Location
            let tPart = S.farm.time;
            let isNightPart = (tPart >= 900 || tPart < 360);
            
            // 3. Define the Zones (River + Cove)
            let inZone = (p.x >= 115 && p.x <= 175 && p.y >= 110 && p.y <= 130) || (p.x >= 195 && p.x <= 300);

            // 4. DRAW (Only if NOT hidden by the ghost fix)
            if (!(isWater && isNightPart && inZone)) {
                let px = p.x*TILE-S.cam.x+sx, py = p.y*TILE-S.cam.y;
                ctx.fillStyle=p.c; ctx.beginPath(); ctx.arc(px, py, p.s, 0, 6.28); ctx.fill();
            }

            if(p.life<=0) p.dead=true;
        });


        S.parts = S.parts.filter(p => !p.dead);



// ADD THIS LINE: Hard limit to 50 particles max to prevent lag spikes
        // ADD THIS LINE: Hard limit to 400 particles max (Increased so dolphins don't vanish)
if (S.parts.length > 400) S.parts.splice(0, S.parts.length - 400);



        // --- PASTE THIS AT THE BOTTOM OF draw(), BELOW S.parts ---

       // --- PASTE THIS AT THE BOTTOM OF draw() ---

        // --- LAYER 4: WEATHER & TIME OVERLAY ---
        // --- LAYER 4: WEATHER & TIME OVERLAY (With Sky Hole) ---



       // --- LAYER 4: WEATHER & TIME OVERLAY (With Shaped Sky Hole) ---
        // --- LAYER 4: WEATHER & TIME OVERLAY (SEMI-OVAL CURVE FIX) ---
       // 1. Determine Tint Color (SMOOTH TRANSITIONS)
        let tR=0, tG=0, tB=0, tA=0; // Default: Day (Transparent)
        let m = S.farm.time;

        // Helper: Linear Interpolation
        const lerp = (start, end, p) => start + (end - start) * p;

        // --- DEFINE COLOR STATES ---
        // NIGHT: Deep Navy (0, 10, 50, 0.6)
        // SUNSET: Warm Gold (255, 140, 0, 0.25)
        
        // A. 5:00 - 6:00 AM: NIGHT -> DAY (Fade Out)
        if (m >= 300 && m < 360) {
            let p = (m - 300) / 60; 
            tR = lerp(0, 0, p);    tG = lerp(10, 0, p);
            tB = lerp(50, 0, p);   tA = lerp(0.6, 0, p);
        }

        // B. 3:00 - 4:00 PM: DAY -> SUNSET (Fade In)
        else if (m >= 900 && m < 960) {
            let p = (m - 900) / 60;
            tR = lerp(0, 255, p);  tG = lerp(0, 140, p);
            tB = lerp(0, 0, p);    tA = lerp(0, 0.25, p);
        }

        // C. 4:00 - 7:00 PM: FULL SUNSET
        else if (m >= 960 && m < 1140) {
            tR = 255; tG = 140; tB = 0; tA = 0.25;
        }

        // D. 7:00 - 8:00 PM: SUNSET -> NIGHT (Color Shift)
        else if (m >= 1140 && m < 1200) {
            let p = (m - 1140) / 60;
            tR = lerp(255, 0, p);  tG = lerp(140, 10, p);
            tB = lerp(0, 50, p);   tA = lerp(0.25, 0.6, p);
        }

        // E. 8:00 PM - 5:00 AM: FULL NIGHT
        else if (m >= 1200 || m < 300) {
            tR = 0; tG = 10; tB = 50; tA = 0.6;
        }

        let tintColor = (tA > 0) ? `rgba(${Math.round(tR)},${Math.round(tG)},${Math.round(tB)},${tA})` : null;

        if (tintColor) {
            ctx.fillStyle = tintColor;
            // ... (Keep existing Hole Cutting Logic below) ...
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(cvs.width, 0);
            ctx.lineTo(cvs.width, cvs.height);
            ctx.lineTo(0, cvs.height);
            ctx.lineTo(0, 0);
            // ... coordinate setup ...
            // --- Coordinate Setup ---
            // [NEW CODE]
// ...
            // ... coordinate setup ...
            // --- Coordinate Setup ---
            let skyL = 200 * TILE - S.cam.x + sx;
            
            // CHANGE THIS LINE: 275 -> 295
            let skyR = 295 * TILE - S.cam.x + sx;
            
            let skyTop = 104 * TILE - S.cam.y;
            // SHIFTED RIGHT +15 (207->222, 258->273)
            let coveL = 222 * TILE - S.cam.x + sx;
            let coveR = 273 * TILE - S.cam.x + sx;
            let coveBaseY = 120 * TILE - S.cam.y;    
            let covePeakY = coveBaseY - (7.0 * TILE); 

            // Hole Logic
// ...

            // Hole Logic
            ctx.lineTo(skyL, skyTop);
            ctx.lineTo(skyL, coveBaseY);
            ctx.lineTo(coveL, coveBaseY);
            ctx.bezierCurveTo(coveL + (12 * TILE), covePeakY, coveR - (12 * TILE), covePeakY, coveR, coveBaseY);
            ctx.lineTo(skyR, coveBaseY);
            ctx.lineTo(skyR, skyTop);
            ctx.lineTo(skyL, skyTop);








// 1. FILL THE DARKNESS FIRST
            // This applies the blue/sunset tint to the screen (cutting out the sky/cove hole defined above)
            ctx.fill(); 

            // 2. DRAW SOFT CAMPFIRE GLOW ON TOP
            // We use 'lighter' blend mode to ADD light to the darkness.
            // This ensures a smooth gradient with NO hard edges.
            // 2. DRAW DYNAMIC CAMPFIRE GLOW
            // FIX: We check the time (m). 
            // - If Sunset: Use LOW intensity to prevent white-out.
            // - If Night: Use HIGH intensity to cut through the darkness.
            



// 2. DRAW SOFT CAMPFIRE GLOW ON TOP (Layer 4)
            // Fix: Use 'lighter' blend with color-consistent transparency to avoid black halos.
            ctx.save();
            ctx.globalCompositeOperation = 'lighter'; 

            S.ents.forEach(e => {
                if (e.kind === 'campfire' && e.lit) {
                     let lx = (e.x + 1) * TILE - S.cam.x + sx; 
                     let ly = (e.y + 1) * TILE - S.cam.y;
                     
                     // 1. SAFE INTENSITY LOGIC
                     let m = S.farm.time;
                     let targetOp = 0.25; 

                     // Night Transition Logic
                     if (m >= 1155 && m < 1230) targetOp = 0.25 + ((m - 1155) / 75) * 0.35;
                     else if (m >= 1230 || m < 300) targetOp = 0.60; 
                     else if (m >= 300 && m < 360) targetOp = 0.60 - ((m - 300) / 60) * 0.35;

                     // 2. FUEL & FADE LOGIC
                     let rawIntensity = (e.fuel > 40) ? 1.0 : (e.fuel / 40.0);
                     let visualIntensity = Math.sqrt(rawIntensity);

                     // Kill graphic early if too dim
                     if (visualIntensity <= 0.01) return;

                     let baseOp = targetOp * visualIntensity;
                     let midOp  = baseOp * 0.6; 

                     // 3. ANIMATION
                     let sizePulse = Math.sin(Date.now() / 400) * 5; 
                     let flicker = (Math.random() - 0.5) * 0.05; 

                     let scale = 0.8 + (0.2 * rawIntensity); 
                     let rad = (250 + sizePulse) * scale;
                     
                     // --- THE FIX: FADE TO TRANSPARENT ORANGE (NOT BLACK) ---
                     let g = ctx.createRadialGradient(lx, ly, 0, lx, ly, rad);
                     
                     // Stop 0: Hot Center (Yellow/White)
                     g.addColorStop(0, `rgba(255, 230, 150, ${Math.max(0, baseOp + flicker)})`); 
                     
                     // Stop 0.4: Warm Body (Orange)
                     g.addColorStop(0.4, `rgba(255, 140, 50, ${Math.max(0, midOp + flicker)})`);
                     
                     // Stop 1.0: TRANSPARENT ORANGE
                     // Using the same RGB values as the previous stop (255,140,50) prevents
                     // the interpolation from turning "brown/black" at the edge.
                     g.addColorStop(1, 'rgba(255, 140, 50, 0)'); 
                     
                     ctx.fillStyle = g;
                     ctx.beginPath(); 
                     ctx.arc(lx, ly, rad, 0, Math.PI*2); 
                     ctx.fill();
                }
            });
            ctx.restore();        }








// --- LAYER 4.5: REDRAW PLAYER (Alpha-Preserving Calc) ---
        // Range: Cove/Sky Area (x=195 to 275)
       // --- LAYER 4.5: REDRAW PLAYER (Standard Blend - Exact Match) ---
        // Range: Cove/Sky Area (x=195 to 275)
        // --- LAYER 4.5: REDRAW PLAYER (Alpha-Preserving Calc) ---
        // Range: Cove/Sky Area (x=195 to 275)
        // --- LAYER 4.5: REDRAW PLAYER (Alpha-Preserving Calc) ---
        // Range: Cove/Sky Area (x=195 to 275)
        // --- LAYER 4.5: REDRAW PLAYER (Alpha-Preserving Calc) ---
        // --- LAYER 4.5: REDRAW PLAYER (Alpha-Preserving Calc) ---
        // Range: Cove/Sky Area (x=195 to 295)
        
        // CHANGE THIS LINE: 275 -> 295
        if (S.p.x >= 195 && S.p.x <= 295 && S.p.y <= 122) {
            
            let tR=0, tG=0, tB=0, tA=0;
            let m = S.farm.time;
            const lerp = (start, end, p) => start + (end - start) * p;

            // 1. GET TINT COLORS (EXACT MATCH TO LAYER 4)
            
            // A. 5-6 AM (Fade Out)
            if (m >= 300 && m < 360) {
                let p = (m - 300) / 60; 
                tR = lerp(0, 0, p); tG = lerp(10, 0, p); tB = lerp(50, 0, p); tA = lerp(0.6, 0, p);
            }
            // B. 3-4 PM (Fade In Sunset)
            else if (m >= 900 && m < 960) {
                let p = (m - 900) / 60;
                tR = lerp(0, 255, p); tG = lerp(0, 140, p); tB = lerp(0, 0, p); tA = lerp(0, 0.25, p);
            }
            // C. 4-7 PM (Full Sunset)
            else if (m >= 960 && m < 1140) {
                tR = 255; tG = 140; tB = 0; tA = 0.25;
            }
            // D. 7-8 PM (Sunset -> Night)
            else if (m >= 1140 && m < 1200) {
                let p = (m - 1140) / 60;
                tR = lerp(255, 0, p); tG = lerp(140, 10, p); tB = lerp(0, 50, p); tA = lerp(0.25, 0.6, p);
            }
            // E. 8 PM - 5 AM (Full Night)
            else if (m >= 1200 || m < 300) {
                tR = 0; tG = 10; tB = 50; tA = 0.6;
            }

            // Only redraw if there is a tint
            if (tA > 0) {
                let gx = Math.floor(S.p.x * TILE - S.cam.x + sx);
                let gy = Math.floor(S.p.y * TILE - S.cam.y);

                // 2. MIX FUNCTION (Standard Alpha Composite)
                const mix = (colorStr) => {
                    let r=0, g=0, b=0, a=1; 

                    if (colorStr.startsWith('#')) {
                        let hex = colorStr.slice(1);
                        if (hex.length === 3) hex = hex[0]+hex[0] + hex[1]+hex[1] + hex[2]+hex[2];
                        let val = parseInt(hex, 16);
                        r = (val >> 16) & 255; g = (val >> 8) & 255; b = val & 255;
                    } 
                    else if (colorStr.startsWith('rgb')) {
                        let parts = colorStr.match(/[\d.]+/g);
                        if(parts) { 
                            r=parseInt(parts[0]); g=parseInt(parts[1]); b=parseInt(parts[2]);
                            if (parts[3]) a = parseFloat(parts[3]); 
                        }
                    } 
                    else return colorStr; 

                    // BLEND FORMULA
                    let finalR = Math.floor(r * (1 - tA) + tR * tA);
                    let finalG = Math.floor(g * (1 - tA) + tG * tA);
                    let finalB = Math.floor(b * (1 - tA) + tB * tA);

                    return `rgba(${finalR},${finalG},${finalB},${a})`;
                };

                // 3. CONTEXT PROXY & DRAW
                let realCtx = ctx;
                let proxyCtx = new Proxy(realCtx, {
                    set: function(target, prop, value) {
                        if (prop === 'fillStyle' || prop === 'strokeStyle') { target[prop] = mix(value); } 
                        else { target[prop] = value; }
                        return true;
                    },
                    get: function(target, prop) {
                        let val = target[prop];
                        if (typeof val === 'function') return val.bind(target);
                        return val;
                    }
                });







                ctx = proxyCtx; 
                
                // 1. SETUP COORDINATES (Match main draw loop variables)
                let x = gx; 
                let y = gy;
                let heroDrawn = false;

                // 2. DRAW BOAT (Full Logic Copy)
                if (S.p.isBoating) {
                    ctx.save();

                    // Helper: Draw hero sandwiched inside boat
                    const injectHero = () => {
                        ctx.save(); 
                        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset to global
                        drawHero(x, y); 
                        heroDrawn = true; 
                        ctx.restore(); // Restore boat transform
                    };

                    // Positioning
                    ctx.translate(x + 25, y + 45); 
                    ctx.scale(1.6, 1.6); 

                    let time = Date.now();
                    let dir = S.p.dir;
                    
                    let bob = Math.sin(time / 450) * 1.5; 
                    let roll = Math.sin(time / 700) * 0.04; 
                    
                    let isMoving = (S.input.keys['arrowup'] || S.input.keys['arrowdown'] || 
                                    S.input.keys['arrowleft'] || S.input.keys['arrowright']);
                    
                    let rowCycle = isMoving ? (time / 220) : 1.5; 
                    let oarSwing = Math.sin(rowCycle) * 0.6; 
                    let oarLift = Math.cos(rowCycle); 
                    
                    // PALETTE
                    const C_HULL_BASE='#5d4037', C_HULL_DARK='#3e2723', C_HULL_TRIM='#8d6e63'; 
                    const C_INT_DARK='#281a17', C_RIBS='#4e342e'; 
                    const C_OAR_SHAFT='#d7ccc8', C_OAR_BLADE='#a1887f', C_BRASS='#ffb74d'; 
                    const WATER_LEVEL = 10; 

                    // Wake
                    ctx.save();
                    ctx.scale(1, 0.3);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.beginPath(); ctx.arc(0, 40, 40 + Math.sin(time/300)*3, 0, 6.28); ctx.fill();
                    ctx.restore();

                    ctx.rotate(roll);
                    ctx.translate(0, bob);

                    const drawBlade = (ctxRef, isSubmerged) => {
                        ctxRef.beginPath(); ctxRef.moveTo(-2, 0); ctxRef.lineTo(-4, 14);  
                        ctxRef.lineTo(4, 14); ctxRef.lineTo(2, 0); ctxRef.closePath();
                        if (isSubmerged) {
                            ctxRef.fillStyle = 'rgba(62, 39, 35, 0.5)'; ctxRef.fill();
                            ctxRef.strokeStyle = 'rgba(255, 255, 255, 0.4)'; ctxRef.lineWidth = 1;
                            ctxRef.beginPath(); ctxRef.moveTo(-6, 2); ctxRef.lineTo(6, 2); ctxRef.stroke();
                        } else {
                            ctxRef.fillStyle = C_OAR_BLADE; ctxRef.fill();
                            ctxRef.fillStyle = 'rgba(0,0,0,0.1)'; ctxRef.fillRect(-0.5, 0, 1, 14);
                        }
                    };

                    // ==========================================
                    // === SIDE VIEW (Left/Right) ===
                    // ==========================================
                    if (dir === 1 || dir === 3) { 
                        let flip = (dir===3) ? -1 : 1;
                        ctx.scale(flip, 1);

                        const drawSideOar = (isFar) => {
                            let angle = 0.55 + (isMoving ? Math.sin(isMoving ? time/220 : 0)*0.5 : 0) + (isFar ? 0 : 0.1);
                            let dx = Math.cos(angle), dy = Math.sin(angle);
                            let px = -4, py = -6;
                            
                            // Handle
                            ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 2; ctx.lineCap = 'round';
                            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - (dx * 12), py - (dy * 12)); ctx.stroke();

                            // Shaft
                            let stickLen = 36; let tipX = px + (dx * stickLen); let tipY = py + (dy * stickLen);
                            let isSubmerged = (tipY > 5);
                            if (isFar && isSubmerged) {
                                let t = (5 - py) / (tipY - py);
                                tipX = px + (dx * stickLen * t); tipY = 5;
                            }
                            ctx.strokeStyle = C_OAR_SHAFT; ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tipX, tipY); ctx.stroke();

                            // Blade
                            if (isFar && isSubmerged) return;
                            ctx.save(); ctx.translate(tipX, tipY); ctx.rotate(angle - Math.PI/2);
                            if (isSubmerged) {
                                ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-4, 16); ctx.lineTo(4, 16); ctx.lineTo(2, 0); 
                                ctx.fillStyle = 'rgba(62, 39, 35, 0.5)'; ctx.fill();
                            } else {
                                ctx.beginPath(); ctx.moveTo(-2, 0); ctx.lineTo(-4, 16); ctx.lineTo(4, 16); ctx.lineTo(2, 0); ctx.closePath();
                                ctx.fillStyle = C_OAR_BLADE; ctx.fill();
                            }
                            ctx.restore();
                        };

                        // 1. Far Oar
                        drawSideOar(true);

                        // 2. Interior
                        ctx.fillStyle = C_INT_DARK;
                        ctx.beginPath();
                        ctx.moveTo(-30, -5); ctx.quadraticCurveTo(0, 6, 36, -12);
                        ctx.lineTo(36, -4); ctx.quadraticCurveTo(0, 14, -30, 0); ctx.fill();

                        // 3. Player
                        injectHero();

                        // 4. Hull
                        ctx.fillStyle = C_HULL_BASE;
                        ctx.beginPath();
                        ctx.moveTo(-32, -4); ctx.quadraticCurveTo(0, 14, 38, -12);
                        ctx.lineTo(32, 8); ctx.quadraticCurveTo(0, 20, -28, 8); ctx.fill();

                        ctx.strokeStyle = C_HULL_DARK; ctx.lineWidth = 1;
                        ctx.beginPath(); ctx.moveTo(-31, 0); ctx.quadraticCurveTo(0, 16, 36, -8); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(-29, 5); ctx.quadraticCurveTo(0, 18, 34, 0); ctx.stroke();

                        ctx.strokeStyle = C_HULL_TRIM; ctx.lineWidth = 2.5;
                        ctx.beginPath(); ctx.moveTo(-32, -4); ctx.quadraticCurveTo(0, 14, 38, -12); ctx.stroke();
                        
                        ctx.fillStyle = C_BRASS; ctx.fillRect(-7, -2, 4, 3);

                        // 5. Near Oar
                        drawSideOar(false);
                    }
                    // ==========================================
                    // === VERTICAL VIEW ===
                    // ==========================================
                    else { 
                        const drawVertOar = (side) => { 
                            ctx.save(); ctx.translate(side * 19, -9);
                            let angle = (side === -1) ? (Math.PI - 0.7 + oarSwing*0.3) : (0.7 - oarSwing*0.3);
                            let len = (isMoving && oarLift < -0.2) ? 20 : 26; 
                            let tipX = Math.cos(angle) * len; let tipY = Math.sin(angle) * len;
                            
                            ctx.strokeStyle = '#3e2723'; ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-Math.cos(angle)*15, -Math.sin(angle)*15); ctx.stroke();
                            ctx.strokeStyle = C_OAR_SHAFT; 
                            ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(tipX, tipY); ctx.stroke();
                            
                            ctx.translate(tipX, tipY); ctx.rotate(angle - Math.PI/2); 
                            let depth = -9 + tipY; 
                            if (depth + 14 > WATER_LEVEL) {
                                ctx.save(); ctx.beginPath(); ctx.rect(-10, WATER_LEVEL - depth, 20, 20); ctx.clip(); drawBlade(ctx, true); ctx.restore();
                            }
                            if (depth < WATER_LEVEL) {
                                ctx.save(); ctx.beginPath(); ctx.rect(-10, -20, 20, WATER_LEVEL - depth); ctx.clip(); drawBlade(ctx, false); ctx.restore();
                            }
                            ctx.restore();
                        };

                        drawVertOar(-1);
                        drawVertOar(1);

                        ctx.save();
                        ctx.scale(1, 0.75);

                        if (dir === 2) { // FRONT VIEW (Facing Camera)
                            // 1. Interior
                            ctx.fillStyle = C_INT_DARK;
                            ctx.beginPath(); ctx.ellipse(0, -6, 18, 7, 0, 0, 6.28); ctx.fill();
                            ctx.strokeStyle = C_RIBS; ctx.lineWidth = 2;
                            ctx.beginPath(); ctx.moveTo(0, -13); ctx.lineTo(0, 1); ctx.stroke();
                            ctx.beginPath(); ctx.moveTo(-9, -10); ctx.lineTo(-7, 0); ctx.stroke();
                            ctx.beginPath(); ctx.moveTo(9, -10); ctx.lineTo(7, 0); ctx.stroke();

                            // 2. Player
                            injectHero(); 

                            // 3. Front Rim
                            ctx.fillStyle = C_HULL_TRIM; ctx.fillRect(-12, -8, 24, 3); ctx.fillRect(-11, -3, 22, 3); 
                            ctx.fillStyle = C_HULL_BASE; ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(0, 30, 20, -6); ctx.fill();
                            ctx.strokeStyle = C_HULL_DARK; ctx.lineWidth = 1;
                            ctx.beginPath(); ctx.moveTo(-17, 4); ctx.quadraticCurveTo(0, 22, 17, 4); ctx.stroke();
                            ctx.beginPath(); ctx.moveTo(-15, 12); ctx.quadraticCurveTo(0, 24, 15, 12); ctx.stroke();
                            ctx.strokeStyle = C_HULL_TRIM; ctx.lineWidth = 3;
                            ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(0, 6, 20, -6); ctx.stroke();
                            ctx.fillStyle = C_HULL_TRIM; ctx.beginPath(); ctx.moveTo(-2, 22); ctx.lineTo(2, 22); ctx.lineTo(0, 26); ctx.fill();

                        
                            
                           } else { // Back View (Combined: Sturdy + Horizontal Bar)
                            
                            // 1. BOTTOM LAYER: Hull & Seat
                            // Main body
                            ctx.fillStyle = C_HULL_BASE;
                            ctx.beginPath(); ctx.moveTo(-19, -10); ctx.quadraticCurveTo(0, 24, 19, -10); ctx.fill();
                            
                            // The Seat (Darker - Player sits on this)
                            ctx.fillStyle = C_HULL_DARK; 
                            ctx.fillRect(-15, -12, 30, 6); 

                            // 2. MIDDLE LAYER: Player
                            injectHero();

                            // 3. TOP LAYER: The Transom (Back Wall)
                            
                            // A. Hull Mask (Covers legs)
                            // Curves down from the bar to the water
                            ctx.fillStyle = C_HULL_BASE;
                            ctx.beginPath(); 
                            ctx.moveTo(-18, -6); 
                            ctx.quadraticCurveTo(0, 22, 18, -6); 
                            ctx.fill();

                            // B. The Horizontal Bar (The distinct beam)
                            let barY = -10;
                            
                            // Main Beam
                            ctx.fillStyle = C_HULL_TRIM; 
                            ctx.fillRect(-20, barY, 40, 6); 

                            // Brass Nails on the ends
                            ctx.fillStyle = C_BRASS;
                            ctx.fillRect(-18, barY + 2, 2, 2);
                            ctx.fillRect(16, barY + 2, 2, 2);

                            // Shadow under the bar (Depth)
                            ctx.fillStyle = 'rgba(0,0,0,0.3)';
                            ctx.fillRect(-18, barY + 6, 36, 2);

                            // C. Sturdy Outer Rim
                            // Connects the horizontal bar to the curved hull
                            ctx.strokeStyle = C_HULL_TRIM; 
                            ctx.lineWidth = 3; 
                            ctx.beginPath(); 
                            ctx.moveTo(-20, barY + 3); 
                            ctx.quadraticCurveTo(0, 25, 20, barY + 3); 
                            ctx.stroke();
                        }
                        
                        
                        ctx.restore();

                        // Oarlocks
                        ctx.fillStyle = C_BRASS;
                        let lockY = (dir===2) ? -8 : -10;
                        ctx.fillRect(-20, lockY, 3, 4); ctx.fillRect(17, lockY, 3, 4);
                    }
                    
                    ctx.restore();
                }

                // 3. Draw Hero if NOT in boat (Double Check)
                if (!heroDrawn) drawHero(x, y);


















                ctx = realCtx; 
            }
        }









// --- LAYER 4.6: INDEPENDENT DOLPHIN REDRAW (Fixes Tint Glitch) ---
        // Runs after darkness layer, regardless of player position.
        
        // --- LAYER 4.6: INDEPENDENT DOLPHIN & PARTICLE REDRAW (Alignment Fix) ---
// Fixes "Half-Bright" glitch by matching coordinates exactly (No Math.floor).
// Runs after the darkness layer to ensure dolphins are tinted correctly everywhere.

let t = S.farm.time;
let needsRedraw = (t >= 900 || t < 360); // Only run at Sunset/Night

if (needsRedraw) {
    // 1. RE-CALCULATE TINT (Must match Layer 4 Overlay exactly)
    let tR=0, tG=0, tB=0, tA=0;
    const lerp = (start, end, p) => start + (end - start) * p;

    if (t >= 300 && t < 360) { let p=(t-300)/60; tR=lerp(0,0,p); tG=lerp(10,0,p); tB=lerp(50,0,p); tA=lerp(0.6,0,p); }
    else if (t >= 900 && t < 960) { let p=(t-900)/60; tR=lerp(0,255,p); tG=lerp(0,140,p); tB=lerp(0,0,p); tA=lerp(0,0.25,p); }
    else if (t >= 960 && t < 1140) { tR=255; tG=140; tB=0; tA=0.25; }
    else if (t >= 1140 && t < 1200) { let p=(t-1140)/60; tR=lerp(255,0,p); tG=lerp(140,10,p); tB=lerp(0,50,p); tA=lerp(0.25,0.6,p); }
    else if (t >= 1200 || t < 300) { tR=0; tG=10; tB=50; tA=0.6; }

    // 2. HELPER: Mix Tint into ANY Color (Generic Hex/RGB)
    const mix = (color) => {
        let r=0, g=0, b=0;
        // Parse Hex
        if(color.startsWith('#')) {
            let hex = color.slice(1);
            if(hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            let bigint = parseInt(hex, 16);
            r = (bigint >> 16) & 255;
            g = (bigint >> 8) & 255;
            b = bigint & 255;
        } 
        // Parse RGB (fallback)
        else if (color.startsWith('rgb')) {
            let parts = color.match(/\d+/g);
            if(parts) { r=parseInt(parts[0]); g=parseInt(parts[1]); b=parseInt(parts[2]); }
        }

        // Apply Tint Math
        let finalR = Math.floor(r * (1 - tA) + tR * tA);
        let finalG = Math.floor(g * (1 - tA) + tG * tA);
        let finalB = Math.floor(b * (1 - tA) + tB * tA);
        return `rgb(${finalR},${finalG},${finalB})`;
    };

    // 3. REDRAW PARTICLES
   // 3. REDRAW PARTICLES
    S.parts.forEach(p => {
        // Redraw water particles (Splash/Wake)
        if (p.c === '#b3e5fc' || p.c === '#00b0ff' || p.c === '#ffffff') {
            
            // === NEW: COVE MASK CHECK ===
            if (p.x >= 222 && p.x <= 273) {
                let relX = p.x - 222;
                const p1x=12, p2x=39, p3x=51;
                let t = relX / 51.0; 
                for(let i=0; i<4; i++) { 
                    let inv = 1-t;
                    let bx = (3*inv*inv*t * p1x) + (3*inv*t*t * p2x) + (t*t*t * p3x);
                    let slope = (3*inv*inv * p1x) + (6*inv*t * (p2x-p1x)) + (3*t*t * (p3x-p2x));
                    if (Math.abs(slope) > 0.001) t -= (bx - relX) / slope;
                }
                let inv = 1-t;
                let curveY = 120 - ((3*inv*inv*t * 7.0) + (3*inv*t*t * 7.0));

                // If above the curve line, DO NOT DRAW
                if (p.y < curveY + 0.2) return; 
            }
            // ============================

            // Exact coordinates (No floor)
            let px = p.x * TILE - S.cam.x + sx;
            let py = p.y * TILE - S.cam.y;
            ctx.fillStyle = mix(p.c); 
            ctx.beginPath(); ctx.arc(px, py, p.s, 0, 6.28); ctx.fill();
        }
    });

    // 4. REDRAW DOLPHINS
    S.parts.forEach(p => {
        if (p.type !== 'dolphin') return;

        // *** FIX: REMOVED Math.floor() to prevent 0.5px ghosting ***
        let dx = p.x * TILE - S.cam.x + sx;
        let dy = p.y * TILE - S.cam.y;
        
        // Skip if way off screen
        if (dx < -100 || dx > cvs.width + 100) return;

        let rot = Math.atan2(p.vy, Math.abs(p.vx) * 0.5);

        ctx.save();
        ctx.translate(dx, dy);
        ctx.scale(p.dir * 3.0, 3.0); 
        ctx.rotate(rot);

        // --- TINTED DOLPHIN ART ---
        // We use mix() on every color to ensure it matches the night/sunset perfectly
        
        // Body
        ctx.fillStyle = mix('#78909c'); 
        ctx.beginPath(); ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-5, -14, 8, -10); 
        ctx.quadraticCurveTo(14, -9, 14, -2); ctx.lineTo(22, 0); ctx.lineTo(15, 3);
        ctx.quadraticCurveTo(0, 10, -20, 0); ctx.fill();

        // Belly
        ctx.fillStyle = mix('#eceff1'); 
        ctx.beginPath(); ctx.moveTo(15, 3); ctx.quadraticCurveTo(5, 7, -12, 1); 
        ctx.lineTo(15, 3); ctx.fill();

        // Fins
        ctx.fillStyle = mix('#546e7a'); 
        ctx.beginPath(); ctx.moveTo(-2, -11); ctx.quadraticCurveTo(1, -20, 6, -10); ctx.fill();
        ctx.beginPath(); ctx.ellipse(7, 3, 5, 2, 0.6, 0, 6.28); ctx.fill(); 

        // Tail
        ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-26, -6); 
        ctx.lineTo(-22, 0); ctx.lineTo(-26, 6); ctx.lineTo(-18, 0); ctx.fill();

        // Details
        ctx.fillStyle = mix('#37474f'); 
        ctx.fillRect(16, 2, 4, 1); 
        ctx.beginPath(); ctx.arc(13, -2, 1, 0, 6.28); ctx.fill(); 

        ctx.restore();
    });
}






// --- PIXEL WOOD SIGN (Static) ---
        // --- EXPANDED DAY BOARD (Under Player) ---
        if (S.farm.dayNoticeTimer > 0) {
            S.farm.dayNoticeTimer--;

            ctx.save();
            
            // 1. Settings: Bigger Size & Position
            let bw = 320, bh = 130; 
            let bx = (cvs.width - bw) / 2;
            let by = (cvs.height / 2) + 60; // Positioned comfortably under player feet

            // 2. Determine Text Content
            let greeting = "A NEW DAY BEGINS";
            let status = "CLEAR SKIES";
            let statusColor = "#aed581"; // Light Green

            let isDebris = (S.farm.day % 3 === 0);
            let isRain = (S.farm.weather === 'rain');

            if (isDebris && isRain) {
                status = "☔ RAIN & DEBRIS!"; // Explicitly mentions Rain
                statusColor = "#ef5350"; // Red (Severe)
            }
            else if (isDebris) {
                status = "⚠ DEBRIS SCATTERED";
                statusColor = "#ff8a65"; // Orange
            } 
            else if (isRain) {
                status = "☔ HEAVY RAIN";
                statusColor = "#4fc3f7"; // Blue
            }

            // 3. Draw The Board
            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(bx + 8, by + 8, bw, bh);

            // Dark Border
            ctx.fillStyle = '#3e2723'; 
            ctx.fillRect(bx, by, bw, bh);

            // Wood Face
            ctx.fillStyle = '#8d6e63'; 
            ctx.fillRect(bx + 5, by + 5, bw - 10, bh - 10);

            // Nails (4 Corners)
            ctx.fillStyle = '#3e2723';
            ctx.fillRect(bx + 10, by + 10, 6, 6);
            ctx.fillRect(bx + bw - 16, by + 10, 6, 6);
            ctx.fillRect(bx + 10, by + bh - 16, 6, 6);
            ctx.fillRect(bx + bw - 16, by + bh - 16, 6, 6);

            // 4. Draw Text
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // A. Greeting (Top, Small)
            ctx.font = "24px 'VT323', monospace";
            ctx.fillStyle = '#d7ccc8'; 
            ctx.fillText(greeting, cvs.width/2, by + 30);

            // B. Day Number (Middle, Huge Gold)
            ctx.font = "bold 60px 'VT323', monospace";
            ctx.fillStyle = '#3e2723'; // Shadow
            ctx.fillText("DAY " + S.farm.day, cvs.width/2 + 3, by + 73);
            ctx.fillStyle = '#ffd700'; // Gold
            ctx.fillText("DAY " + S.farm.day, cvs.width/2, by + 70);

            // C. Status Message (Bottom, Colored)
            ctx.font = "bold 26px 'VT323', monospace";
            ctx.fillStyle = statusColor;
            ctx.fillText(status, cvs.width/2, by + 105);

            ctx.restore();
        }







// --- PASTE THIS NEW CODE HERE ---
        // --- LAYER 4.8: RAIN VISUALS ---
        if (S.farm.weather === 'rain') {
            ctx.save();
            ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)'; // Light Blue/White
            ctx.lineWidth = 1;
            ctx.beginPath();

            let rTime = Date.now() / 40; // Rain Speed
            let rainCount = 400;         // Density
            
            // Camera Parallax for Rain
            let camOffX = S.cam.x * 0.8; 
            let camOffY = S.cam.y * 0.8;

            for (let i = 0; i < rainCount; i++) {
                // Pseudo-random positions based on index (Stable noise)
                let rx = (Math.sin(i * 12.9898) * 43758.5453) * (cvs.width + 400); 
                let ry = (Math.cos(i * 78.233) * 43758.5453) * (cvs.height + 400);

                // Animate (Fall down + Slight slant left)
                let dropX = (rx - (rTime * 2) - camOffX) % (cvs.width + 200); 
                let dropY = (ry + (rTime * 12) - camOffY) % (cvs.height + 200);

                // Wrap around logic to keep them on screen
                if (dropX < -100) dropX += (cvs.width + 200);
                if (dropY < -100) dropY += (cvs.height + 200);

                // Draw streak
                ctx.moveTo(dropX, dropY);
                ctx.lineTo(dropX - 2, dropY + 12);
            }
            ctx.stroke();
            
            // Optional: Draw subtle gloom overlay
            ctx.fillStyle = 'rgba(20, 30, 40, 0.15)'; 
            ctx.fillRect(0, 0, cvs.width, cvs.height);
            
            ctx.restore();
        }







        // --- LAYER 5: UI & CLOCK ---
        // Only draw if player is in farm
        if (S.p.x > 118) {  
            
           // === DRAW STATS BOX (Hide if Boating) ===
           if (!S.p.isBoating) {
                ctx.save();
            


            // 1. Background Box
            ctx.fillStyle = 'rgba(46, 125, 50, 0.9)'; 
            ctx.strokeStyle = '#81c784'; 
            ctx.lineWidth = 3;
            
            ctx.fillRect(10, 10, 280, 50);
            ctx.strokeRect(10, 10, 280, 50);
            
            // 2. Text (Day & Money)
            ctx.font = "28px 'VT323', monospace";
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            let textY = 37; 
            
            ctx.fillStyle = '#fff';
            ctx.fillText("Day: " + S.farm.day, 25, textY);
            
            ctx.fillStyle = '#81c784';
            ctx.fillText("|", 110, textY - 2);
            
            ctx.fillStyle = '#fff';
            ctx.fillText("Money:", 130, textY);
            
           ctx.fillStyle = '#ffd700'; 
            ctx.fillText(S.farm.money + "g", 210, textY);
            
            ctx.restore();
           } // <--- CLOSING THE (!isBoating) CHECK HERE

            // === DRAW CLOCK (Always Visible) ===
            let clkX = cvs.width - 50;
            let clkY = 50;              
            let clkR = 35;
            
            // Face
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.beginPath(); ctx.arc(clkX, clkY, clkR, 0, 6.28); ctx.fill();
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
            
            // Calculate Time (Hour Only)
            let hour = Math.floor(m / 60); 
            
            // 1. HOUR HAND
            let hAng = (hour % 12) * 30 * (Math.PI/180) - (Math.PI/2);
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.moveTo(clkX, clkY); 
            ctx.lineTo(clkX + Math.cos(hAng)*(clkR-15), clkY + Math.sin(hAng)*(clkR-15)); 
            ctx.stroke();

            // 2. MINUTE HAND
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; 
            ctx.beginPath(); ctx.moveTo(clkX, clkY); 
            ctx.lineTo(clkX, clkY - (clkR - 5)); 
            ctx.stroke();
            
            // Center Dot
            ctx.fillStyle = '#f00'; ctx.beginPath(); ctx.arc(clkX, clkY, 4, 0, 6.28); ctx.fill();
        }

        // --- MENUS ---



        // --- MENUS ---
        if (S.ui === 'shop') drawShop();
        if (S.ui === 'bag' || S.ui === 'bag_opt') drawBag(); 

        // --- 3. CONTEXT MENUS (Bag / Ground / Sleep / Animals) ---
           // --- CONTEXT MENUS ---
        if (S.ui === 'bag_opt' || S.ui === 'item_opt' || S.ui === 'sleep_opt' || S.ui === 'chicken_opt' || S.ui === 'cow_opt' || S.ui === 'pet_opt' || S.ui === 'horse_opt'|| S.ui === 'boat_opt' || S.ui === 'fire_opt') {
            
            let opts = [];
            
            // 1. BAG MENU
            if (S.ui === 'bag_opt') {
                let item = getBagItemAt(S.bag.tab, S.bag.cx, S.bag.cy);
                let actionName = (item && item.id === 'carrot_seeds') ? "Plant" : "Hold";
                opts = [actionName, "Cancel"];
            } 
            // 2. SLEEP MENU
            else if (S.ui === 'sleep_opt') {
                opts = ["Sleep", "Cancel"];
            }
            // 3. CHICKEN MENU
            else if (S.ui === 'chicken_opt') {
                opts = ["Cancel", "Move"];
            }
            // 4. COW MENU (THIS IS THE MISSING PART)
            else if (S.ui === 'cow_opt') {
                opts = ["Pet", "Get Milk", "Cancel"];
            }








		// 4.5 PET MENU
            else if (S.ui === 'pet_opt') {
                // If following -> Button says "Roam"
                // If roaming -> Button says "Follow"
                let pState = S.menuTarget.following ? "Roam" : "Follow";
                
                opts = ["Pet", "Move", pState, "Cancel"];
            }




// --- PASTE THIS NEW BLOCK HERE ---
// 5. CAMPFIRE MENU
else if (S.ui === 'fire_opt') {
                 let txt = S.menuTarget.lit ? "Stoke (+3h)" : "Light Fire (3h)";
                 opts = [txt, "Cancel"];
            }



		else if (S.ui === 'horse_opt') {
                opts = ["Pet", "Ride", "Cancel"];
            }
else if (S.ui === 'boat_opt') {
                opts = ["Sail", "Cancel"];
        }





            // 5. GROUND ITEM MENU (Default)
            else {
                let k = `${S.menuTarget.x},${S.menuTarget.y}`;
                if (S.farm.structures[k] === 'letter_brick') {
                    opts = ["Change Letter", "Move", "Put Back", "Cancel"];
                } else {
                    opts = ["Cancel", "Move", "Put Back"];
                }
            }






            let mw = 120, mh = opts.length * 35 + 10;
            let mx, my;

            // Positioning
            if (S.ui === 'bag_opt') {
                 const boxW = 320; const bgMx = (cvs.width - boxW) / 2;
                 const gridStartX = bgMx + (boxW - (4*45 + 3*10)) / 2; 
                 const gridStartY = ((cvs.height - 400) / 2) + 60;
                 mx = gridStartX + S.bag.cx * (45 + 10) + 20; 
                 my = gridStartY + S.bag.cy * (45 + 10) + 20;
            } 
            else if (S.ui === 'sleep_opt') {
                mx = (cvs.width - mw)/2; 
                my = (cvs.height - mh)/2; 
            } 
            else {
                 mx = (S.menuTarget.x * TILE - S.cam.x) + 40; 
                 my = (S.menuTarget.y * TILE - S.cam.y) - 20;
                 if (mx + mw > cvs.width) mx -= (mw + 50);
                 if (my + mh > cvs.height) my -= mh;
            }

            ctx.fillStyle = '#fff'; ctx.fillRect(mx, my, mw, mh);
            ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(mx, my, mw, mh);

            ctx.font = "bold 14px Arial";
            for(let i=0; i<opts.length; i++) {
                let oy = my + 25 + (i*35);
                if (S.menuSel === i) {
                    ctx.fillStyle = '#eee'; ctx.fillRect(mx+2, oy-18, mw-4, 30);
                    ctx.fillStyle = '#000'; ctx.fillText("> " + opts[i], mx + 10, oy);
                } else {
                    ctx.fillStyle = '#555'; ctx.fillText(opts[i], mx + 10, oy);
                }
            }
        }



// --- VISUAL EDITOR (Text on Right) ---
        if (S.ui === 'letter_edit') {
            let tx = S.menuTarget.x;
            let ty = S.menuTarget.y;
            
            // 1. Dim
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, cvs.width, cvs.height);

            // 2. Spotlight Coords
            let px = Math.floor(tx * TILE - S.cam.x + sx);
            let py = Math.floor(ty * TILE - S.cam.y);
            
            // Re-calc specific heights used in main draw for consistency
            let lift = 18;
            let groundY = py + TILE;
            let topFaceY = groundY - TILE - 25; // Lifted up extra for the "Pop out" effect

            // 3. Draw Spotlight Brick (Simplified High-Res version)
            let data = S.farm.letterData[`${tx},${ty}`] || { char:'A', col:0 };
            let c = BRICK_COLS[data.col];

            // Body
            ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(px, topFaceY+lift, TILE, TILE-lift, 8); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); // Shadow
            // Top
            ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(px, topFaceY, TILE, TILE-lift+2, 8); ctx.fill();
            // Highlight
            let gradH = ctx.createLinearGradient(px, topFaceY, px+TILE, topFaceY+TILE-lift);
            gradH.addColorStop(0, 'rgba(255,255,255,0.5)'); gradH.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = gradH; ctx.fill();
            // Border Glow
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
            // Letter
            ctx.fillStyle = (data.col === 5) ? '#fff' : 'rgba(0,0,0,0.8)';
            ctx.font = "bold 28px monospace"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.fillText(data.char, px + TILE/2, topFaceY + (TILE-lift)/2 + 2);

            // 4. ARROWS & LABELS
            const drawArrow = (ax, ay, rot) => {
                ctx.save(); ctx.translate(ax, ay); ctx.rotate(rot * Math.PI / 180);
                ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(10, 10); ctx.lineTo(0, 5); ctx.lineTo(-10, 10); ctx.closePath();
                ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.stroke(); ctx.fillStyle = '#fff'; ctx.fill();
                ctx.restore();
            };

            let cx = px + TILE/2;
            let cy = topFaceY + TILE/2 - 10;
            let b = Math.sin(Date.now() / 150) * 4;

            // --- HORIZONTAL (LETTER) ---
            drawArrow(px - 25 + b, cy, -90); // Left
            drawArrow(px + TILE + 25 - b, cy, 90);  // Right
            
            // LABEL: "LETTER" on the RIGHT side of the right arrow
            ctx.font = "bold 16px sans-serif"; 
            ctx.fillStyle = "#fff";
            ctx.textAlign = "left"; // Align Left so it starts after the arrow
            ctx.textBaseline = "middle";
            ctx.fillText("LETTER", px + TILE + 45 - b, cy); 

            // --- VERTICAL (COLOR) ---
            drawArrow(cx, topFaceY - 25 + b, 0);   // Up
            drawArrow(cx, topFaceY + TILE + 5 - b, 180); // Down

            // LABEL: "COLOR" on TOP
            ctx.textAlign = "center";
            ctx.fillText("COLOR", cx, topFaceY - 45 + b);
            
            // Reset Defaults
            ctx.textAlign = "left"; 
            ctx.textBaseline = "alphabetic";
        }


// Only draw arrow if NO menu is open
if (S.ui === 'none') drawTutorialArrow();

    } // <--- END OF draw()




///////////////////




    // --- Helpers ---


///////////////////////////////
function solid(x, y, ignoreEnt) {
        // 1. Map Boundaries & Bedrock
        if (x < 0 || y < 0 || x >= MAP_S || y >= MAP_S) return true;
        
        let ix = Math.floor(x), iy = Math.floor(y);

        // Bridge Rail Block
        if (iy === 138 && ix >= 146 && ix <= 149) return true;

        let t = S.map[iy * MAP_S + ix];
        if (t === T.BEDROCK || t === T.WATER) return true; 

        // 2. Fences, Debris & Structures
        let k = `${ix},${iy}`;
        if (S.farm.fences[k] || S.farm.debris[k] || S.farm.structures[k]) return true;

        // 3. Entities
        for (let e of S.ents) {
            if (e === ignoreEnt) continue;

            // A. FarmHouse Logic
            if (e.kind === 'FarmHouse') {
                if (x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h) {
                    
                    // --- NEW: BLOCK HORSE RIDING ---
                    // If riding, the whole house is solid (cannot enter door)
                    if (S.p.isRiding) return true; 
                    // -------------------------------

                    let lx = ix - e.x, ly = iy - e.y;
                    let isWall = (ly === 0 || ly === e.h - 1 || lx === 0 || lx === e.w - 1);
                    let doorPos = (e.w === 9) ? 4 : 3;
                    let isDoor = (ly === e.h - 1 && lx === doorPos);
                    
                    // Block walls, allow door (only if NOT riding)
                    if (isWall && !isDoor) return true; 
                }
                continue; 
            }

            // B. Trees (Trunk Collision)
            if (e.kind === 'tree_apple' || e.kind === 'tree_orange' || e.kind === 'tree_coconut') {
                if (x >= e.x && x < e.x + 3 && y >= e.y && y < e.y + 3) {
                    if ((iy - e.y) >= 2 && (ix - e.x) === 1) return true;
                }
                continue;
            }
            if (e.kind === 'tree_2x2') {
                if (x >= e.x && x < e.x + 2 && y >= e.y && y < e.y + 2) return true;
                continue;
            }

            // --- FIX: BUFFERED STUCK PROTECTION ---
            if (e.kind === 'boat' && S.p) {
                 // If player is even SLIGHTLY inside the boat (buffer 0.2), ignore collision
                 // This prevents getting stuck on the edge after dismounting
                 let buffer = 0.2;
                 if (S.p.x + 0.5 >= e.x - buffer && S.p.x + 0.5 < e.x + e.w + buffer && 
                     S.p.y + 0.5 >= e.y - buffer && S.p.y + 0.5 < e.y + e.h + buffer) {
                     continue; 
                 }
            }
            // --------------------------------------

            // C. General Obstacles

            // C. General Obstacles
            
            // --- FIX: ANIMAL GHOSTING ---
            // If the mover (ignoreEnt) is an animal, and the obstacle (e) is an animal, ignore it.
            const farmAnimals = ['chicken', 'cow', 'horse', 'pet'];
            if (ignoreEnt && farmAnimals.includes(ignoreEnt.type) && farmAnimals.includes(e.type)) {
                continue; 
            }



// --- NEW: STUCK PROTECTION (Boat) ---
            // If the player is currently standing INSIDE a boat (e.g. just dismounted),
            // ignore that boat's collision so they can walk out of it.
            if (e.kind === 'boat' && S.p) {
                 // Check if player's CENTER is inside this boat
                 let px = S.p.x + 0.5; 
                 let py = S.p.y + 0.5;
                 
                 // If we are overlapping, treat boat as non-solid
                 if (px >= e.x && px < e.x + e.w && py >= e.y && py < e.y + e.h) {
                     continue; 
                 }
            }
            // ------------------------------------




            // ----------------------------

            if (x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h) {
                return true;
            }
        }
        return false;
    }
/////////////////////////////

    
    function isBlocked(x, y) { return solid(x+0.5, y+0.5); }


////////////////////////////
function addEnt(type, kind, x, y) {
        let w = 1, h = 1;

        // --- Standard Sizes ---
        if (kind === 'FarmHouse') { 
            // FIX: Check Level. Lv1=7, Lv2+=9
            w = (S.farm.houseLevel >= 2) ? 9 : 7; 
            h = 4; 
        }
        else if (kind === 'Telebooth') { w = 1; h = 1.5; }
        else if (kind === 'Bed') { w = 1; h = 2; }
        else if (kind === 'Table') { w = 2; h = 1; }
        else if (kind === 'ShippingBin' || kind === 'Well') { w = 2; h = 2; }
        else if (kind === 'boulder' || kind === 'stump') { w = 2; h = 2; } 
        else if (kind === 'tree_2x2') { w = 2; h = 2; } 
        else if (kind === 'tree_apple' || kind === 'tree_orange') { w = 3; h = 3; } 
        else if (kind === 'chicken') { w = 0.8; h = 0.8; }
        else if (kind === 'dog' || kind === 'cat') { w = 1; h = 1; }
        else if (kind === 'horse') { w = 1.2; h = 1.2; }
        else if (kind === 'cow') { w = 1.4; h = 1.4; }
// --- DEFINE BOAT SIZE (2x2) ---
        // --- DEFINE BOAT SIZE (HUGE: 3 Wide, 2 Tall) ---
        else if (kind === 'boat') { w = 3; h = 2; }

 // --- ADD/REPLACE THIS LINE ---
        else if (kind === 'campfire') { w = 2; h = 2; }


        let e = { type, kind, x, y, w, h };

        // Initialize Properties
        if (kind === 'cow') { e.milked = false; e.dir = 2; }
        if (kind === 'pet') { e.following = false; } // Ensure pet has state

        if (kind === 'tree_apple' || kind === 'tree_orange') {
            e.apples = [ Math.random()<0.7, Math.random()<0.7, Math.random()<0.7 ];
            if (!e.apples[0] && !e.apples[1] && !e.apples[2]) e.apples[1] = true;
        }

        S.ents.push(e);
    }
////////////////////////////

    function xIn(e, x, y) { return x >= e.x && x < e.x+e.w && y >= e.y && y < e.y+e.h; }


    function popText(x, y, txt, c, outline, small) {
        let d = document.createElement('div'); 
        d.className='float-txt'; d.innerText=txt; d.style.color=c;
        let rect = cvs.getBoundingClientRect();
        d.style.left = ((x*TILE - S.cam.x) + rect.left + 25) + 'px';
        d.style.top = ((y*TILE - S.cam.y) + rect.top) + 'px';
        if(small) d.style.fontSize = "20px";
        document.body.appendChild(d); setTimeout(()=>d.remove(), 800);
    }




   function part(x, y, c, n, s=3) {
        for(let i=0; i<n; i++) S.parts.push({
            x:x+(Math.random()-.5), y:y+(Math.random()-.5), 
            vx:(Math.random()-.5)*0.1, vy:(Math.random()-.5)*0.1, 
            c, life:20+Math.random()*10, s,
            type: 'norm' // <--- THIS PREVENTS THE CRASH
        });
    }




// [THE MEAT] --- PASTE THIS HERE (Replacing the old showChat) ---
    // --- UPDATED CHAT HELPER (Now respects duration!) ---
    function showChat(name, txt, duration) {
        // If no duration is given, default to 3000ms (3 seconds)
        if (!duration) duration = 3000;

        const c = document.getElementById('rpg-chat');
        if (!c) return;

        document.getElementById('chat-name').innerText = name;
        document.getElementById('chat-text').innerText = txt;
        
        c.style.opacity = 1;

        // 1. Clear any existing timer so it doesn't close early
        if (c.hideTimer) clearTimeout(c.hideTimer);
        
        // 2. Set new timer using the duration we passed (e.g., 8000)
        c.hideTimer = setTimeout(() => {
            c.style.opacity = 0;
        }, duration);
    }



// --- FIELD EXPANSION LOGIC ---
  function isFarmable(x, y) {
        // --- 1. GARDEN AREA ---
        // Uses 'gardenLevel' (gl)
        // Anchor: Bottom-Left (x=138, y=131)
        // Grows: Right (+x) and Up (-y)
        
        let gl = S.farm.gardenLevel || 1; 
        
        // Dimensions based on Garden Level
        let gw = (gl >= 2) ? 3 : 2; 
        let gh = (gl >= 2) ? 5 : 4; 
        
        let minGX = 138;
        let maxGX = 138 + gw - 1;
        let maxGY = 131;
        let minGY = 131 - gh + 1;

        if (x >= minGX && x <= maxGX && y >= minGY && y <= maxGY) return true;

        // --- 2. MAIN FIELD AREA ---
        // Uses 'fieldLevel' (fl)
        // Anchor: Top-Left (x=124, y=141)
        
        let fl = S.farm.fieldLevel || 1;
        let fw = 8, fh = 8;
        
        if (fl === 2) { fw = 12; fh = 9; }
        if (fl >= 3)  { fw = 14; fh = 10; }

        let minFX = 124;
        let maxFX = 124 + fw - 1;
        let minFY = 141;
        let maxFY = 141 + fh - 1;

        if (x >= minFX && x <= maxFX && y >= minFY && y <= maxFY) return true;

        return false;
    }

////////////////////////
function drawShop() {
        // --- PARCHMENT THEME SETTINGS ---
        const boxW = 380;
        const boxH = 420;
        const mx = (cvs.width - boxW) / 2;
        const my = (cvs.height - boxH) / 2;

        const C_PAPER  = '#fff8e1'; // Slightly lighter cream
        const C_INK    = '#3e2723';
        const C_BORDER = '#5d4037';
        const C_HL     = 'rgba(255, 111, 0, 0.15)'; // Orange Highlight

        // 1. Background
        ctx.fillStyle = C_PAPER;
        ctx.fillRect(mx, my, boxW, boxH);
        ctx.strokeStyle = C_BORDER; ctx.lineWidth = 5;
        ctx.strokeRect(mx, my, boxW, boxH);

        // 2. Header / Tabs
        ctx.fillStyle = 'rgba(93, 64, 55, 0.1)'; 
        ctx.fillRect(mx, my, boxW, 50);
        
        ctx.font = "bold 14px monospace"; 
        
        // Calculate exact width per tab to center them perfectly
        let tabWidth = boxW / TABS.length;

        for (let i = 0; i < TABS.length; i++) {
            // Calculate Center X for this tab
            let tx = mx + (i * tabWidth) + (tabWidth / 2);
            let ty = my + 30;
            
            if (S.shop.tab === i) {
                ctx.fillStyle = '#e65100'; 
                // Draw text centered
                ctx.textAlign = "center";
                ctx.fillText(TABS[i], tx, ty);
                
                // Draw underline centered
                ctx.fillRect(tx - 25, my + 36, 50, 3);
            } else {
                ctx.fillStyle = '#a1887f'; 
                ctx.textAlign = "center";
                ctx.fillText(TABS[i], tx, ty);
            }
            ctx.textAlign = "left"; // Reset
        }

        // 3. Items List
        let items = SHOP_DATA[S.shop.tab];
        let maxVisible = 7; 
        
        // Scroll Logic
        let startIdx = 0;
        if (S.shop.sel >= maxVisible) {
            startIdx = S.shop.sel - maxVisible + 1;
        }

        let listY = my + 70;
        let rowH = 40;

        ctx.font = "16px monospace";

        for (let i = 0; i < maxVisible; i++) {
            let dataIndex = startIdx + i;
            if (dataIndex >= items.length) break;

            let item = items[dataIndex];
            let iy = listY + (i * rowH);

            // A. Highlight Selected Row
            if (S.shop.sel === dataIndex) {
                ctx.fillStyle = C_HL; 
                ctx.fillRect(mx + 10, iy - 25, boxW - 20, 32);
                ctx.strokeStyle = '#ffcc80'; ctx.lineWidth = 1;
                ctx.strokeRect(mx + 10, iy - 25, boxW - 20, 32);
            }

            // B. Draw Icon & Name
            ctx.textAlign = 'left';
            if (S.shop.sel === dataIndex) ctx.fillStyle = '#e65100'; // Active Text
            else ctx.fillStyle = C_INK; // Normal Text
            
            let icon = item.icon || '📦';
            ctx.fillText(icon + " " + item.name, mx + 25, iy);

            // C. Draw Price
            ctx.textAlign = 'right';
            let canAfford = (S.farm.money >= item.price);
            
            // Price Color (Green if affordable, Red if not)
            ctx.fillStyle = canAfford ? '#2e7d32' : '#c62828'; 
            ctx.fillText(item.price + "g", mx + boxW - 30, iy);
        }

        // Reset Alignment
        ctx.textAlign = 'left';

        // 4. Scrollbar
        if (items.length > maxVisible) {
            let barH = 240;
            let barX = mx + boxW - 8;
            let barY = listY - 20;
            
            ctx.fillStyle = '#d7ccc8'; ctx.fillRect(barX, barY, 4, barH); // Track
            let progress = startIdx / (items.length - maxVisible);
            let knobY = barY + (progress * (barH - 30));
            ctx.fillStyle = '#8d6e63'; ctx.fillRect(barX - 2, knobY, 8, 30); // Knob
        }

        // 5. Info Panel (Bottom)
        // Adjusted anchor point to give more room
        let infoY = my + boxH - 55;
        
        // Separator Line
        ctx.fillStyle = '#d7ccc8'; 
        ctx.fillRect(mx + 10, infoY - 5, boxW - 20, 2);
        
        let selItem = items[S.shop.sel];
        let hintX = mx + boxW - 25; // Right Alignment

        if (selItem) {
            // A. Description (Left Side) - Moved down to +15
            ctx.fillStyle = '#5d4037'; ctx.font = "italic 14px serif";
            ctx.textAlign = "left";
            ctx.fillText(selItem.desc || "...", mx + 25, infoY + 15);
            
            // B. [SPC] BUY (Right Side) - Aligned with Description (+15)
            ctx.textAlign = "right";
            ctx.font = "bold 12px monospace";
            
            if (S.farm.money >= selItem.price) {
                ctx.fillStyle = '#2e7d32'; // Green
                ctx.fillText("[SPC] BUY", hintX, infoY + 15);
            } else {
                ctx.fillStyle = '#ef5350'; // Red
                ctx.fillText("NO FUNDS", hintX, infoY + 15);
            }
        }

        // C. [ESC] CLOSE (Bottom Right) - Pushed down to +35
        ctx.textAlign = "right";
        ctx.font = "bold 12px monospace";
        ctx.fillStyle = '#c62828'; // Red
        ctx.fillText("[ESC] CLOSE", hintX, infoY + 35);
        
        ctx.textAlign = "left"; // Reset alignment
    }

////////////////////////











function updatePets() {
        // FIXED: Only freeze if we are currently in the Pet Menu
        if (S.ui === 'pet_opt') return;

        S.ents.forEach(e => {
            if (e.type !== 'pet') return;
            
            // FOLLOW MODE
            if (e.following) {
                let dist = Math.hypot(S.p.x - e.x, S.p.y - e.y);
                if (dist > 1.5) {
                    let spd = 0.06;
                    let dx = (S.p.x - e.x) / dist * spd;
                    let dy = (S.p.y - e.y) / dist * spd;

                    if (!solid(e.x + dx + 0.5, e.y + dy + 0.5, e)) { e.x += dx; e.y += dy; }
                    else if (!solid(e.x + dx + 0.5, e.y + 0.5, e)) { e.x += dx; }
                    else if (!solid(e.x + 0.5, e.y + dy + 0.5, e)) { e.y += dy; }

                    if (Math.abs(dx) > Math.abs(dy)) e.dir = (dx > 0) ? 1 : 3;
                    else e.dir = (dy > 0) ? 2 : 0;
                }
                return;
            }

            // WANDER MODE
            if (typeof e.walkTimer === 'undefined') e.walkTimer = 0;
            if (e.walkTimer <= 0 && Math.random() < 0.02) {
                 e.dir = Math.floor(Math.random()*4); e.walkTimer = 30 + Math.random()*40;
            }
            if (e.walkTimer > 0) {
                e.walkTimer--;
                let dx=0, dy=0;
                if (e.dir===0) dy=-1; else if (e.dir===1) dx=1; else if (e.dir===2) dy=1; else if (e.dir===3) dx=-1;
                let spd = 0.03; let tx = e.x + (dx*spd), ty = e.y + (dy*spd);
                if (!solid(tx+0.5, e.y+0.5, e) && !solid(e.x+0.5, ty+0.5, e)) { e.x = tx; e.y = ty; } else e.walkTimer=0;
            }
        });
    }













function drawHero(x, y) {
        let dir = S.p.dir; 
        let cls = S.p.class || 'warrior';
        




     let isMoving = (S.input.keys['arrowup']||S.input.keys['arrowdown']||S.input.keys['arrowleft']||S.input.keys['arrowright']);
    let tick = Date.now() / 150;
    
    // --- CHANGE 1: STOP BOBBING IF BOATING ---
    let bob = (S.p.isBoating) ? 0 : Math.sin(tick) * 1.5;
    let walk = (isMoving && !S.p.isRiding && !S.p.isBoating) ? Math.sin(tick * 3) : 0;
    
    ctx.save();
    
    // 1. POSITION & SCALE (1.3x)
    ctx.translate(x + 25, y + 42); 
    ctx.scale(1.3, 1.3); 
    
    if (dir === 3) ctx.scale(-1, 1); 

    // --- COLOR PALETTES (Keep your existing color code here...) ---
    let cSkin='#ffe0bd', cEye='#111';
    let cMain, cSec, cAcc, cDark, cBoot, cHair, cHigh;
    if(cls === 'warrior') { cMain='#eceff1'; cSec='#1565c0'; cAcc='#ffd700'; cDark='#455a64'; cBoot='#37474f'; cHair='#3e2723'; cHigh='#ffffff'; } 
    else if(cls === 'mage') { cMain='#4527a0'; cSec='#7c4dff'; cAcc='#00e5ff'; cDark='#311b92'; cBoot='#1a1a1a'; cHair='#ffe082'; cHigh='#b388ff'; } 
    else { cMain='#37474f'; cSec='#ff6d00'; cAcc='#ffeb3b'; cDark='#263238'; cBoot='#212121'; cHair='#5d4037'; cHigh='#ff9e80'; }

    // --- CHANGE 2: LIFT LOGIC ---
    let lift = S.p.isRiding ? 14 : 0;
    if (S.p.isBoating) lift = -8; // Sink player into boat
    ctx.translate(0, -lift);

    // --- CHANGE 3: SHADOW LOGIC ---
    if(!S.p.isRiding && !S.p.isBoating) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, 6.28); ctx.fill();
    }


        // --- SHADOW (Only if NOT riding) ---
        if(!S.p.isRiding) {
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.beginPath(); ctx.ellipse(0, 0, 10, 4, 0, 0, 6.28); ctx.fill();
        }

        // 1. LEGS (Logic Updated for Riding)
        const drawBoot = (bx, by, w, h, color) => {
            ctx.fillStyle = color; ctx.fillRect(bx, by, w, h); 
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(bx, by + h - 2, w, 2); 
        };




        if (S.p.isRiding) {
            // === RIDING POSE ===
            if(dir === 0 || dir === 2) { 
                // Front/Back: Wide Straddle
                drawBoot(-12, -8, 5, 10, cBoot); // Left leg out
                drawBoot(7, -8, 5, 10, cBoot);   // Right leg out
            } else { 
                // Side: Seated pose (Only draw near leg)
                // Leg angled forward slightly
                drawBoot(-2, -10, 6, 10, cBoot); 
            }
        } else {
            // === WALKING POSE ===
            if(dir === 0 || dir === 2) { 
                drawBoot(-7, -12 + (walk*2), 5, 12, cBoot);
                drawBoot(2, -12 - (walk*2), 5, 12, cBoot);
            } else { 
                drawBoot(-4 + (walk*4), -12, 6, 12, cDark); 
                drawBoot(-4 - (walk*4), -13, 6, 12, cBoot); 
            }
        }

        // 2. BODY
        let bodyY = -24 + bob;
        if(dir !== 2) { 
            if(cls === 'mage') {
                ctx.fillStyle = cHair;
                if(dir === 0) ctx.fillRect(-11, bodyY-12, 22, 22); 
                else ctx.fillRect(-8, bodyY-8, 10, 18); 
            }
            ctx.fillStyle = (cls==='mage') ? cDark : cSec; 
            if(dir === 0) ctx.fillRect(-10, bodyY+10, 20, 10);
            else ctx.fillRect(-9, bodyY+8, 6, 10);
        }

        ctx.fillStyle = cMain;
        if(dir === 0 || dir === 2) { 
            ctx.fillRect(-9, bodyY, 18, 14); 
            ctx.fillStyle = cDark; ctx.fillRect(-9, bodyY+10, 18, 3);
            ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-5, bodyY, 10, 2); 
            if(dir === 2) { 
                if(cls==='warrior') { 
                    ctx.fillStyle = cSec; ctx.fillRect(-3, bodyY+2, 6, 8); ctx.fillRect(-6, bodyY+4, 12, 4);
                    ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillRect(-3, bodyY+2, 2, 2);
                }
                if(cls==='mage') { ctx.fillStyle = cAcc; ctx.fillRect(-2, bodyY, 4, 14); }
                if(cls==='rogue') { ctx.fillStyle = '#5d4037'; ctx.beginPath(); ctx.moveTo(-9, bodyY); ctx.lineTo(-6, bodyY); ctx.lineTo(9, bodyY+14); ctx.lineTo(6, bodyY+14); ctx.fill(); }
            }
        } else { 
            ctx.fillRect(-6, bodyY, 12, 14);
            ctx.fillStyle = cDark; ctx.fillRect(-6, bodyY+10, 12, 3);
        }

        // 3. HEAD & HAIR
        let headY = bodyY - 14;
        if(dir !== 0) { ctx.fillStyle = cSkin; ctx.fillRect(-8, headY, 16, 16); }

        ctx.fillStyle = cHair;
        if (cls === 'warrior') {
            if (dir === 2) { ctx.fillRect(-9, headY, 2, 8); ctx.fillRect(7, headY, 2, 8); }
            else if (dir === 0) { ctx.fillRect(-8, headY+2, 16, 12); } 
            else { ctx.fillRect(-8, headY, 14, 14); }
        } else if (cls === 'mage') {
            if (dir === 2) { ctx.fillRect(-11, headY-2, 5, 20); ctx.fillRect(6, headY-2, 5, 20); } 
            else if (dir !== 0) { ctx.fillRect(-6, headY-2, 12, 20); }
        } else { 
            if (dir === 2) { ctx.fillRect(-9, headY, 18, 4); ctx.fillRect(-8, headY+2, 3, 3); ctx.fillRect(0, headY+2, 4, 3); ctx.fillRect(6, headY+2, 2, 4); ctx.fillRect(-9, headY, 2, 10); ctx.fillRect(7, headY, 2, 10); } 
            else if (dir === 0) { ctx.fillRect(-9, headY-2, 18, 16); } 
            else { ctx.fillRect(-8, headY, 14, 4); ctx.fillRect(-10, headY+4, 6, 10); }
        }

        if(cls === 'warrior') { 
            ctx.fillStyle = cMain; ctx.fillRect(-9, headY-5, 18, 10); 
            ctx.fillStyle = cHigh; ctx.fillRect(-6, headY-4, 4, 3);
            if(dir === 0 || dir === 2) { 
                ctx.fillStyle = cMain; ctx.fillRect(-10, headY-2, 2, 14); ctx.fillRect(8, headY-2, 2, 14); 
                if(dir === 0) ctx.fillRect(-5, headY+2, 10, 8); 
            } else { ctx.fillStyle = cMain; ctx.fillRect(0, headY-2, 9, 14); }
            ctx.fillStyle = cSec; 
            if (dir === 0 || dir === 2) ctx.fillRect(-2, headY-8, 4, 16); 
            else { ctx.fillRect(-9, headY-8, 18, 4); ctx.fillRect(7, headY-8, 4, 16); }
        } else if(cls === 'mage') { 
            ctx.fillStyle = cMain; ctx.beginPath(); ctx.moveTo(-14, headY); ctx.lineTo(14, headY); ctx.lineTo(0, headY-20); ctx.fill();
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-14, headY, 28, 2);
            ctx.fillStyle = cAcc; ctx.fillRect(-8, headY-2, 16, 2);
        } else { 
            ctx.fillStyle = cSec; 
            if (dir === 2 || dir === 0) { 
                ctx.beginPath(); ctx.ellipse(0, headY, 10, 4, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, headY-3, 9, 5, 0, 0, 6.28); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.ellipse(-3, headY-5, 4, 2, 0, 0, 6.28); ctx.fill();
                ctx.strokeStyle = cAcc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(4, headY-3); ctx.quadraticCurveTo(12, headY-12, 8, headY-18); ctx.stroke();
            } else { 
                ctx.beginPath(); ctx.moveTo(-10, headY); ctx.lineTo(10, headY); ctx.lineTo(6, headY-5); ctx.lineTo(-8, headY-5); ctx.fill();
                ctx.strokeStyle = cAcc; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, headY-3); ctx.quadraticCurveTo(-10, headY-8, -14, headY-2); ctx.stroke();
            }
        }

        if(dir !== 0) {
            ctx.fillStyle = (cls==='mage') ? cAcc : cEye; 
            if(dir === 2) { ctx.fillRect(-5, headY+6, 3, 3); ctx.fillRect(2, headY+6, 3, 3); } 
            else { ctx.fillRect(3, headY+6, 3, 3); }
        }

        if(cls === 'rogue') {
            ctx.fillStyle = cAcc; 
            if(dir===2 || dir===0) ctx.fillRect(-7, headY+12, 14, 4);
            else ctx.fillRect(-4, headY+12, 8, 4);
        }




        // 4. ARMS (FIXED OFFSET & ANCHORS)
        ctx.fillStyle = cMain;
        
        if (S.p.isBoating) {
            let time = Date.now();
            let isMoving = (S.input.keys['arrowup']||S.input.keys['arrowdown']||S.input.keys['arrowleft']||S.input.keys['arrowright']);
            
            // Physics Sync (Must match Boat Logic exactly)
            let boatBob = Math.sin(time / 450) * 1.5; 
            let rowCycle = isMoving ? (time / 220) : 1.5; 
            let oarSwing = Math.sin(rowCycle) * 0.6; 
            
            // --- COORDINATE MAPPER ---
            // Maps a point from Boat-Space (Scale 1.6, Y+45) to Player-Space (Scale 1.3, Y+42)
            const getGripPoint = (bX, bY) => {
                // 1. Boat Local -> Screen Pixels (relative to tile center)
                let screenX = bX * 1.6;
                let screenY = (bY + boatBob) * 1.6 + 3; 

                // 2. Adjust for Player "Sink" Lift (The player is drawn at y - lift)
                screenY += lift; 

                // 3. Screen Pixels -> Player Local
                return { x: screenX / 1.3, y: screenY / 1.3 };
            };

            // === A. FRONT/BACK VIEW (Dual Oars) ===
           if(dir === 0 || dir === 2) { 
                // 1. Calculate Oar Handle Tips in Boat Space
                let baseAng = 0.7; 
                let gripDist = 5;

                // Left Oar
                let angL = Math.PI - baseAng + (oarSwing * 0.3);
                let handleLx = -19 - (Math.cos(angL) * gripDist); 
                let handleLy = -9 - (Math.sin(angL) * gripDist);

                // Right Oar
                let angR = baseAng - (oarSwing * 0.3);
                let handleRx = 19 - (Math.cos(angR) * gripDist); 
                let handleRy = -9 - (Math.sin(angR) * gripDist);

                // 2. Convert to Player Space
                let pL = getGripPoint(handleLx, handleLy);
                let pR = getGripPoint(handleRx, handleRy);

                // 3. Define Shoulders
                let sLy = bodyY + 4; 
                let sRy = bodyY + 4; 
                let sLx = -9; 
                let sRx = 9;

                // --- DRAW LEFT ARM (Subtle Bend) ---
                ctx.save();
                let dx = pL.x - sLx; let dy = pL.y - sLy;
                let dist = Math.hypot(dx, dy);
                let rot = Math.atan2(dy, dx);
                
                ctx.translate(sLx, sLy);
                ctx.rotate(rot - Math.PI/2);
                
                // FIXED: Reduced multiplier from 0.6 to 0.25 for a softer look
                let bend = Math.max(0, (24 - dist) * 0.25); 
                
                ctx.strokeStyle = (cls==='warrior') ? cMain : cSec; 
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                // Negative X bends "Left" (Outward for left arm)
                ctx.quadraticCurveTo(-bend, dist/2, 0, dist); 
                ctx.stroke();

                ctx.fillStyle = cSkin; 
                ctx.fillRect(-2.5, dist - 2, 5, 5); 
                ctx.restore();

                // --- DRAW RIGHT ARM (Subtle Bend) ---
                ctx.save();
                dx = pR.x - sRx; dy = pR.y - sRy;
                dist = Math.hypot(dx, dy);
                rot = Math.atan2(dy, dx);
                
                ctx.translate(sRx, sRy);
                ctx.rotate(rot - Math.PI/2);
                
                // FIXED: Reduced multiplier here too
                bend = Math.max(0, (24 - dist) * 0.25);

                ctx.strokeStyle = (cls==='warrior') ? cMain : cSec; 
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.moveTo(0, 0);
                // Positive X bends "Right" (Outward for right arm)
                ctx.quadraticCurveTo(bend, dist/2, 0, dist); 
                ctx.stroke();
                
                ctx.fillStyle = cSkin; 
                ctx.fillRect(-2.5, dist - 2, 5, 5); 
                ctx.restore();
            }
            
           // === B. SIDE VIEW (JUST A SIMPLE ARM) ===
            // === B. SIDE VIEW (PHYSICS-BASED IK) ===
            else { 
               // 1. REPLICATE OAR MATH
                let baseAngle = 0.55; 
                let angle = baseAngle + (oarSwing * 0.5) + 0.1; 
                
                // 2. DEFINE GRIP POINT
                // -4.0 places hand on the lower shaft (as requested)
                let gripLen = -4.0;

                let boatHandleX = -4 - (Math.cos(angle) * gripLen);
                let boatHandleY = -6 - (Math.sin(angle) * gripLen);

                // 3. TRANSFORM TO PLAYER SPACE
                let targetX = (boatHandleX * 1.6) / 1.3;
                let targetY = ((boatHandleY + boatBob) * 1.6 + 3 + lift) / 1.3;

                // 4. SHOULDER POSITION
                let shoulderY = bodyY + 4;
                let shoulderX = 0; 

                // 5. DRAW ARM (Distance-Based Bend)
                let dx = targetX - shoulderX;
                let dy = targetY - shoulderY;
                let dist = Math.hypot(dx, dy);

                // IK LOGIC:
                // Instead of guessing the wave, we calculate bend based on extension.
                // If the arm extends (dist increases), bend decreases.
                // If the arm retracts (dist decreases), bend increases.
                // Formula: (MaxArmLength - CurrentDistance) * Sharpness
                let bend = Math.max(0, (26 - dist) * 0.8);

                ctx.save();
                ctx.translate(shoulderX, shoulderY); 
                
                // Rotate canvas to point from Shoulder -> Hand
                ctx.rotate(Math.atan2(dy, dx));

                ctx.strokeStyle = (cls==='warrior') ? cMain : cSec; 
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                
                ctx.beginPath();
                ctx.moveTo(0, 0);
                
                // Draw Arm Curve
                ctx.quadraticCurveTo(dist / 2, bend, dist, 0);
                ctx.stroke();

                // 6. DRAW HAND
                // Rotate hand slightly to grip the oar naturally
                // We subtract the arm angle to reset, then add the oar angle
                ctx.translate(dist, 0);
                ctx.rotate(-Math.atan2(dy, dx) + (angle + 1.5)); // +1.5 aligns hand perpendicular to oar
                
                ctx.fillStyle = cSkin; 
                ctx.fillRect(-2.5, -2.5, 5, 5);
                
                ctx.restore();
            }
        }
        
        // --- C. STANDARD WALKING ---
        else {
            let armS = (dir===2 && isMoving && !S.p.isRiding) ? -walk : 0;
            let sideArm = (S.p.isRiding) ? 2 : (walk*3); 
            if(dir === 0 || dir === 2) { 
                ctx.fillStyle = (cls==='warrior') ? cMain : cSec; ctx.fillRect(-14, bodyY, 5, 5); ctx.fillRect(9, bodyY, 5, 5);
                ctx.fillStyle = (cls==='warrior') ? cDark : cMain; ctx.fillRect(-13, bodyY+3+armS, 4, 2); ctx.fillRect(9, bodyY+3-armS, 4, 2);
                ctx.fillStyle = (cls==='warrior') ? cMain : cSkin; ctx.fillRect(-13, bodyY + 5 + armS, 4, 7); ctx.fillRect(9, bodyY + 5 - armS, 4, 7);
                ctx.fillStyle = (cls==='mage') ? cSkin : cDark; ctx.fillRect(-13, bodyY + 10 + armS, 4, 3); ctx.fillRect(9, bodyY + 10 - armS, 4, 3);
            } else { 
                ctx.fillStyle = (cls==='warrior') ? cMain : cSec; ctx.fillRect(sideArm, bodyY + 2, 4, 6);
                ctx.fillStyle = (cls==='warrior') ? cMain : cSkin; ctx.fillRect(sideArm, bodyY + 8, 4, 6);
            }
        }





        // 5. CARRY ITEM
        if (S.carry && S.carry.icon) {
            ctx.save();
            if (dir === 3) ctx.scale(-1, 1); 
            ctx.font = "20px serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
            ctx.shadowColor="#000"; ctx.shadowBlur=4;
            ctx.fillText(S.carry.icon, 0, headY - 20 + bob);
            ctx.shadowBlur=0;
            ctx.restore();
        }

        ctx.restore();
    }















//////////////////////////

    // [REPLACE THE ENTIRE RETURN BLOCK AT THE BOTTOM OF THE FILE]
    return {
        init: init,
        update: update,
        draw: draw,
        handleInput: handleInput, // <--- Must be here
	updateFarmUI: updateFarmUI, // <--- ADD THIS LINE IF MISSING
	toggleBag: toggleBag, // <--- Add this line for safety
        

        // --- 1. BUY ITEMS & TOOLS ---
        // --- 1. BUY ITEMS & TOOLS ---
        // --- 1. BUY ITEMS & TOOLS ---
        buy: (it, p) => {
            // A. PET BUY
            if (it === 'dog' || it === 'cat') {
                let existing = S.ents.find(e => e.type === 'pet' && e.kind === it);
                if (existing) { popText(S.p.x, S.p.y, "Have " + it, "#ef5350"); return; }
                if (S.farm.money >= p) {
                    S.farm.money -= p;
                    let spawnX = 132, spawnY = 133;
                    for(let y=132; y<=135; y++) for(let x=126; x<=138; x++) if(!solid(x+0.5, y+0.5)) { spawnX=x; spawnY=y; x=999; y=999; }
                    addEnt('pet', it, spawnX, spawnY);
                    
                    S.farm.justBought = true; // <--- SIGNAL
                    
                    popText(S.p.x, S.p.y, "New Friend!", "#fff");
                    updateFarmUI();
                } else popText(S.p.x, S.p.y, "No Funds", "#f00");
                return;
            }

            // B. ANIMAL BUY
            if (it === 'chicken' || it === 'cow' || it === 'horse') {
                if (it === 'horse' && (S.ents.find(e => e.kind === 'horse') || S.p.isRiding)) { popText(S.p.x, S.p.y, "One Horse Only!", "#ef5350"); return; }
                let count = S.ents.filter(e => e.type === it).length;
                if (count >= 16) { popText(S.p.x, S.p.y, "MAX LIMIT", "#ef5350"); return; }
                let spawnX = null, spawnY = null;
                for(let y=132; y<=135; y++) for(let x=126; x<=138; x++) if(!solid(x+0.5, y+0.5)) { spawnX=x; spawnY=y; x=999; y=999; }
                
                if (S.farm.money >= p && spawnX) {
                    S.farm.money -= p;
                    addEnt(it, it, spawnX, spawnY);
                    
                    S.farm.justBought = true; // <--- SIGNAL
                    
                    popText(S.p.x, S.p.y, it.toUpperCase() + "!", "#fff");
                    updateFarmUI();
                } else popText(S.p.x, S.p.y, S.farm.money<p?"No Funds":"Yard Full!", "#f00");
                return;
            }

            // C. TOOL MAX CHECK
            if (['hoe', 'sickle', 'hammer', 'axe', 'water'].includes(it)) {
                let currentLvl = S.farm.tools[it] || 1;
                if (currentLvl >= 2) { popText(S.p.x, S.p.y, "MAX (LV.2)", "#ef5350"); return; }
            }

            // D. STANDARD BUY (SEEDS)
            if(S.farm.money >= p) {
                S.farm.money -= p;
                if(it === 'hoe') S.farm.tools.hoe++;
                else if(it === 'sickle') S.farm.tools.sickle++;
                else if(it === 'hammer') S.farm.tools.hammer++;
                else if(it === 'axe') S.farm.tools.axe++;
                else if(it === 'water') S.farm.tools.water++;
                else S.farm.inventory[it] = (S.farm.inventory[it]||0) + 1;

                S.farm.justBought = true; // <--- SIGNAL (Critical for Tutorial)

                S.audio.play('buy'); // AUDIO
                updateFarmUI(); 
                popText(S.p.x, S.p.y, "BOUGHT!", "#ffd700");
            } else {
                S.audio.play('error'); // AUDIO
                popText(S.p.x, S.p.y, "No Funds", "#f00");
            }
        },














        // --- HELPERS ---
        upgradeTool: (t, p) => { Region9Farm.buy(t, p); }, // Redirects to buy()
        sleep: sleep,
        toggleShop: () => { document.getElementById('shop-menu').style.display = document.getElementById('shop-menu').style.display==='block'?'none':'block'; },
        closeMenus: () => { document.querySelectorAll('.farm-menu').forEach(e => e.style.display='none'); },
        closeSleep: () => { document.getElementById('sleep-menu').style.display='none'; },
        swapItem: (it) => {
            if(S.farm.inventory[it] > 0) { S.farm.inventory[it]--; S.farm.storage[it]++; }
            else if(S.farm.storage[it] > 0) { S.farm.storage[it]--; S.farm.inventory[it]++; }
            renderChest(); updateFarmUI();
        },
        setTool: (i) => { S.farm.toolIndex = i; updateFarmUI(); }
    };
})();