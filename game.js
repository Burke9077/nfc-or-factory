document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cardImage = document.getElementById('card-image');
    const feedback = document.getElementById('feedback');
    const realButton = document.getElementById('real-button');
    const nfcButton = document.getElementById('nfc-button');
    const guessedCounter = document.getElementById('guessed');
    const remainingCounter = document.getElementById('remaining');
    const accuracyCounter = document.getElementById('accuracy');
    const downloadButton = document.getElementById('download-button');
    const resultsSection = document.getElementById('results-section');
    const finalAccuracy = document.getElementById('final-accuracy');
    const finalCorrect = document.getElementById('final-correct');
    const finalTotal = document.getElementById('final-total');
    const gameContainer = document.getElementById('game-container');
    
    // Game State
    let allCards = [];
    let currentCardIndex = 0;
    let correctGuesses = 0;
    let totalGuesses = 0;
    let gameResults = [];
    
    // Initialize the game
    function initGame() {
        // Create array of all card objects with their paths and types
        for (let i = 1; i <= 9; i++) {
            allCards.push({
                path: `photos/real/${i}.jpg`,
                type: 'real'
            });
            allCards.push({
                path: `photos/nfc/${i}.jpg`,
                type: 'nfc'
            });
        }
        
        // Shuffle the cards
        shuffleArray(allCards);
        
        // Display first card
        displayCard();
        
        // Update counters
        updateCounters();
    }
    
    // Shuffle array using Fisher-Yates algorithm
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // Display current card
    function displayCard() {
        if (currentCardIndex < allCards.length) {
            cardImage.src = allCards[currentCardIndex].path;
            feedback.classList.add('hidden');
        } else {
            // Game over - all cards shown
            // Keep the last card displayed (don't change cardImage.src)
            feedback.textContent = `Game Over!`;
            feedback.classList.remove('hidden');
            feedback.style.backgroundColor = 'rgba(156, 39, 176, 0.7)';
            realButton.disabled = true;
            nfcButton.disabled = true;
            
            // Update and show results section
            const accuracy = Math.round((correctGuesses / totalGuesses) * 100);
            finalAccuracy.textContent = `${accuracy}%`;
            finalCorrect.textContent = correctGuesses;
            finalTotal.textContent = totalGuesses;
            resultsSection.classList.remove('hidden');
            
            // Show download button
            downloadButton.classList.remove('hidden');
        }
    }
    
    // Update game counters
    function updateCounters() {
        guessedCounter.textContent = totalGuesses;
        remainingCounter.textContent = allCards.length - totalGuesses;
        
        if (totalGuesses > 0) {
            const accuracy = Math.round((correctGuesses / totalGuesses) * 100);
            accuracyCounter.textContent = `${accuracy}%`;
        } else {
            accuracyCounter.textContent = '0%';
        }
    }
    
    // Process user's guess
    function processGuess(guess) {
        // Prevent multiple guesses on the same card
        if (feedback.classList.contains('hidden')) {
            const currentCard = allCards[currentCardIndex];
            const isCorrect = guess === currentCard.type;
            
            totalGuesses++;
            if (isCorrect) {
                correctGuesses++;
                feedback.textContent = "CORRECT!";
                feedback.className = "correct";
            } else {
                feedback.textContent = `WRONG! It's ${currentCard.type.toUpperCase()}`;
                feedback.className = "incorrect";
            }
            
            // Store result for download
            gameResults.push({
                cardNumber: totalGuesses,
                cardPath: currentCard.path,
                actualType: currentCard.type,
                guess: guess,
                isCorrect: isCorrect
            });
            
            feedback.classList.remove('hidden');
            updateCounters();
            
            // Go to next card after delay
            setTimeout(() => {
                currentCardIndex++;
                displayCard();
            }, 1500);
        }
    }
    
    // Generate downloadable results
    function generateResults() {
        const accuracy = Math.round((correctGuesses / totalGuesses) * 100);
        let resultsText = `Pokémon Card Challenge Results\n`;
        resultsText += `==============================\n\n`;
        resultsText += `Final Score: ${correctGuesses} / ${totalGuesses}\n`;
        resultsText += `Accuracy: ${accuracy}%\n\n`;
        resultsText += `Detailed Results:\n`;
        resultsText += `----------------\n\n`;
        
        gameResults.forEach(result => {
            const cardName = result.cardPath.split('/').pop().replace('.jpg', '');
            resultsText += `Card ${result.cardNumber}: ${cardName}\n`;
            resultsText += `Type: ${result.actualType.toUpperCase()}\n`;
            resultsText += `Your guess: ${result.guess.toUpperCase()}\n`;
            resultsText += `Result: ${result.isCorrect ? 'CORRECT ✓' : 'INCORRECT ✗'}\n\n`;
        });
        
        return resultsText;
    }
    
    // Download results as image
    function downloadResultsAsImage() {
        // First, hide the card container which is causing the security issue
        const originalCardDisplay = cardImage.style.display;
        const cardContainer = document.getElementById('card-container');
        const originalContainerDisplay = cardContainer.style.display;
        
        // Hide card container
        cardContainer.style.display = 'none';
        
        // Create a temporary results view for screenshot
        const tempResults = document.createElement('div');
        tempResults.className = 'temp-results';
        tempResults.innerHTML = `
            <h2>Pokémon Card Challenge Results</h2>
            <div class="results-icon">🏆</div>
            <div class="results-stats">
                <p class="final-score"><span class="label">Accuracy:</span> <span class="highlight">${finalAccuracy.textContent}</span></p>
                <p class="final-score"><span class="label">Score:</span> <span class="highlight">${finalCorrect.textContent} / ${finalTotal.textContent}</span></p>
                <p class="final-score"><span class="label">Date:</span> <span class="highlight">${new Date().toLocaleDateString()}</span></p>
            </div>
            <div class="footer-note">
                <p>Thanks for playing!</p>
                <div class="pokemon-icons">⚡ 🔥 💧 🍃 ✨</div>
            </div>
        `;
        
        // Create a custom container for the screenshot to avoid extra space
        const screenshotContainer = document.createElement('div');
        screenshotContainer.className = 'screenshot-container';
        screenshotContainer.appendChild(tempResults);
        document.body.appendChild(screenshotContainer);
        
        // Hide original elements
        const originalGameContainerDisplay = gameContainer.style.display;
        gameContainer.style.display = 'none';
        
        // Take screenshot of just the temp results
        html2canvas(screenshotContainer, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher resolution
            logging: false
        }).then(canvas => {
            // Convert canvas to image and download
            try {
                const image = canvas.toDataURL('image/jpeg', 0.9);
                const link = document.createElement('a');
                link.href = image;
                link.download = 'pokemon-card-challenge-results.jpg';
                link.click();
            } catch (e) {
                console.error("Error generating image:", e);
                alert("Sorry, there was an error creating the image. This might be due to browser security restrictions.");
            }
            
            // Restore original display
            gameContainer.style.display = originalGameContainerDisplay;
            cardContainer.style.display = originalContainerDisplay;
            cardImage.style.display = originalCardDisplay;
            
            // Remove temporary elements
            document.body.removeChild(screenshotContainer);
        });
    }
    
    // Event Listeners
    realButton.addEventListener('click', function() {
        processGuess('real');
    });
    
    nfcButton.addEventListener('click', function() {
        processGuess('nfc');
    });
    
    downloadButton.addEventListener('click', downloadResultsAsImage);
    
    // Add keyboard shortcuts for faster gameplay
    document.addEventListener('keydown', function(event) {
        // Only process if feedback is hidden (no active guess)
        if (feedback.classList.contains('hidden') && !realButton.disabled) {
            if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') {
                // Left arrow or 'A' key for REAL
                realButton.classList.add('key-active');
                setTimeout(() => realButton.classList.remove('key-active'), 200);
                processGuess('real');
            } else if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') {
                // Right arrow or 'D' key for NFC
                nfcButton.classList.add('key-active');
                setTimeout(() => nfcButton.classList.remove('key-active'), 200);
                processGuess('nfc');
            }
        }
        
        // Allow spacebar to download results at the end
        if (event.key === ' ' && !downloadButton.classList.contains('hidden')) {
            downloadButton.classList.add('key-active');
            setTimeout(() => downloadButton.classList.remove('key-active'), 200);
            downloadResultsAsImage();
        }
    });
    
    // Initialize the game
    initGame();
});
