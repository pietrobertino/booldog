# BoolShop — Accessori per cani e gatti

Piattaforma e-commerce lato cliente dedicata alla vendita di accessori di qualità per cani e gatti.

## Concept

- **Categoria merceologica:** accessori per cani e gatti (collari, guinzagli, pettorine, trasportini, cucce, tiragraffi, giochi, ciotole, abbigliamento, igiene)
- **Sentiment:** minimal e moderno, pensato per trasmettere la qualità dei prodotti
- **Cliente tipo:** chi cerca qualità nel prodotto per il bene del proprio animale domestico
- **Fascia di mercato:** medio-alta

## Stack tecnologico

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** MySQL
- **Stile:** Bootstrap + CSS

## Funzionalità di base

- Homepage con hero space e sezioni prodotti
- Pagina di ricerca con barra di ricerca e ordinamento (prezzo, nome, recenti)
- Pagina di dettaglio prodotto con possibilità di aggiunta al carrello
- Carrello con modifica quantità e calcolo del totale
- Checkout con dati di fatturazione e spedizione + riepilogo ordine
- Invio email di conferma ordine al cliente e al venditore

## Funzionalità extra (10 punti)

| Funzionalità | Coefficiente |
|---|---|
| Doppia visualizzazione dei risultati di ricerca (griglia / lista) | 1 |
| Codici sconto (con validità dal/al) | 2 |
| Wishlist (lista dei desideri con pagina dedicata) | 2 |
| Prodotti correlati nella pagina di dettaglio | 2 |
| Gestione quantità (stock, blocco aggiunta al carrello, blocco checkout) | 3 |
| **Totale** | **10** |

## Requisiti tecnici rispettati

- Sito completamente responsive
- Validazione dati lato client e lato server
- Nessun refresh completo della pagina (SPA)
- Pagina 404 gestita
- Risultati di ricerca condivisibili tramite URL
- ID prodotto mai esposto (uso dello slug)

## Struttura del database

Tabelle principali:

- `products` — anagrafica prodotti (slug, nome, prezzo, stock, categoria, brand, tipo animale)
- `brands` — marchi (Ferplast, Trixie, Hunter, Ruffwear, Kong, Julius-K9, Hurtta, Catit, Stefanplast, Flexi)
- `animal_types` — tipo di animale (Cane, Gatto, Cane e Gatto)
- `orders` - ordini dell'utente
- `coupons` — codici sconto con periodo di validità e soglia minima

## Come avviare il progetto

### Backend

```bash
cd backend
npm install
npm run server
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Team

Progetto sviluppato come esercitazione finale del corso Boolean.
