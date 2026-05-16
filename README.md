# IAMBOT HUB — eFootball Esports Platform

A high-performance responsive web portal built for **IAMBOT LEAGUE (FREE EDITION)** tournaments. Styled with a custom dark **"Gaming Noir"** theme utilizing a Goku Black aura color palette (Deep Black, Purples, Crimson, and Neon Hot Pink lighting glow effects).

## Features Included
1. **Dynamic Realtime Pipeline:** Submissions require validation from the built-in control terminal dashboard map panel before rendering into cards.
2. **Double Signup Prevention Block:** Protects data paths against redundant participant inputs.
3. **Control Portal Console:** Hidden administrative configuration framework dashboard layer to pass, drop, or clear comments and graphic elements.
4. **Instant BANTER-CHAT Board:** Built-in community message channel board space.
5. **Dynamic Search Filtration:** Client-side live search filter targeting active competitor elements.

---

## Configuration & Connection Mapping Setup Guide

To establish persistence connections across all live modular blocks inside the layout, establish a free database cloud workspace on Firebase via these processing tracks:

1. Navigate to the [Firebase Dashboard Hub](https://console.firebase.google.com/).
2. Click **Add Project**, type `iambot-hub`, and bypass Google Analytics configuration selections.
3. Inside the left side panel configuration list tree, expand **Build**, then click on **Realtime Database**.
4. Click **Create Database**, select a nearby server data center cluster, and select **Start in test mode** settings profiles options.
5. Head to the **Rules** navigation bar section inside your Realtime Database workspace space window panel layout and verify the tracking rules syntax block maps exactly like this:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   
