You are a senior software architect and frontend engineer.

Your task is to design a complete plan for a React web application that allows users to create and edit a Dungeons & Dragons character sheet.

Context:
- The UI should replicate a traditional D&D character sheet (attributes, skills, HP, attacks, equipment, traits, etc.)
- The sheet must be fully editable
- Data must be persisted in localStorage
- Users must be able to export the sheet as a JSON file
- Users must be able to import a previously exported JSON to restore the sheet
- The Export, Import and Save buttons are located in the header of the page

Requirements:
1. Provide a clear architecture for the app (folders, components, state management)
2. Define a complete data model (TypeScript interfaces)
3. Break down the UI into reusable components
4. Explain how state flows through the app
5. Suggest best practices for performance and scalability
6. Define how validation should work (e.g., numeric fields, constraints)
7. Provide a strategy for styling (e.g., CSS Modules, Tailwind, or Vanilla Extract)
8. Suggest how to make the layout resemble a printable sheet (like a PDF)
9. Include accessibility considerations
10. Include a roadmap with milestones (MVP → advanced features)

11. Define all fields of the character sheet and their relative positions in the layout, following a structure similar to a traditional D&D sheet:

- Top Header (horizontal layout):
  - Character Name (large, prominent)
  - Class & Level
  - Background
  - Race
  - Alignment

- Left Column (vertical alignment):
  - Attributes (stacked vertically):
    - Strength
    - Dexterity
    - Constitution
    - Intelligence
    - Wisdom
    - Charisma
-Center Column
  - Inspiration
  - Proficiency Bonus
  - Saving Throws (grouped under attributes)(there will be a checkbox on each of them, signaling proficiency or not)
  - Skills (scrollable or long list under saving throws there will also have a checkbox signaling proficiency)
  - Proficiencies & Languages

- Right Column:
  - Armor Class
  - Initiative
  - Speed
  - Hit Points:
    - Max HP
    - Current HP
    - Temporary HP
  - Hit Dice
  - Death Saves (successes/failures)
  - Features & Traits (A long scrollable list of collapsable accordions)(you can add an item by click on an icon that will open a pop-up with title, origin and description)(in the list, in the right side of the accordion titles, there will be a delete icon, with a confirmation popup)

- Bottom Section (full width or split layout):
  
  - Inventory (Again, list of accordions with title and description, with the add, edit and delete button)

- New Section (below all the previous, full width, considerable height)
    - Backstory (scrollable)

- New Section (below all the previous, full width, considerable height)
    - Spells (list of accordions, editable, fields: title, level, description)(grouped by level, sorted by level)

- Additional Notes:
  - Define grouping, spacing, and hierarchy clearly
  - Indicate which sections should be scrollable vs fixed
  - Ensure layout is printable and maintains structure when exported (A4-friendly)
  - This is supposed to be a "infinite scrolling" page, so you don't need to worry about height

Constraints:
- Pure frontend (no backend)
- Prefer clean and maintainable architecture
- Avoid overengineering

Output format:
- Sections with clear headers
- Code examples when useful
- No unnecessary explanations