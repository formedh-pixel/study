
# Hanja Study App Blueprint

## Overview

A simple and intuitive web application for studying Hanja (Chinese characters). The app provides a user-friendly interface for learning Hanja characters based on proficiency levels.

## Style, Design, and Features

### Landing Page

*   **Logo:** A title that says "한자공부".
*   **Welcome Message:** A friendly message that says "열심히 공부 해봐요".
*   **Entry Button:** A button labeled "입장" to proceed to the level selection screen.

### Level Selection Page

*   **Title:** A prominent title that says "급수선택".
*   **Home Button:** A discreet "home" button to return to the landing page.
*   **Level Buttons:** Beautifully designed, card-like buttons for each proficiency level.

### Hanja Grid Page

*   **Layout:** A three-section vertical layout.
*   **Hanja Grid:** A scrollable grid displaying Hanja characters with details.

### Hanja Modal

*   **Trigger:** Clicking on a Hanja character in the grid.
*   **Content:**
    *   Displays the selected Hanja, its `eum` (음), and `hun` (훈).
    *   A user drawing area with a canvas.
    *   A stroke order animation area (initially hidden).
*   **Controls:**
    *   **Stroke Order Button:** A "획순보기" / "획순닫기" button to toggle the stroke order animation.
    *   **Reset Button:** A "다시쓰기" button to clear the user's drawing.
    *   **Close Button:** To dismiss the modal.
*   **Behavior:** The modal closes on clicking the close button or outside the content area.

## Current Plan

### Implement Stroke Order Animation

1.  **Update `blueprint.md`:** Document the new stroke order animation feature.
2.  **Modify `index.html`:**
    *   Add the `hanzi-writer` CDN script.
    *   Add a container for the modal buttons.
    *   Add the "획순보기" button.
    *   Add a container for the stroke order animation.
3.  **Modify `style.css`:**
    *   Style the new button container and the "획순보기" button.
    *   Ensure the animation container and writing canvas are positioned correctly.
4.  **Modify `main.js`:**
    *   Implement logic to toggle between the writing canvas and the stroke order animation.
    *   Initialize the `hanzi-writer` library when the "획순보기" button is clicked.
    *   Animate the character strokes.
    *   Handle the cleanup of the `hanzi-writer` instance.
