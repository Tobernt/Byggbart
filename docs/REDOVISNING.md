# Redovisning — konferensuppgift 2, cirka 3 minuter

Kursens instruktion: visa konferenssidan, ändra webbläsarens bredd och förklara dina
CSS-effekter och avancerade selektorer. Redovisningsordningen slumpas på sista lektionen.
Kursen slutar den 20 november 2026. Kontrollera exakt lektionstid i Teams.

Källa: https://postmodernistx.github.io/bcu26d-musical-octo-disco/moduler/vecka-5/01-redovisning.html

## Innan lektionen

1. Starta `Starta konferensen.cmd` och öppna sidan i ett vanligt webbläsarfönster.
2. Ha `src/styles.css` öppen i editorn. Sök på `:focus-within`, `nth-child` och `data-featured`.
3. Testa Teams-skärmdelning och välj konferensens fönster, inte sidan med manus.
4. Öva en gång med timern på `redovisning.html`. Tala med egna ord.

## Körschema

| Tid       | Visa                                       | Förklara                                                                                                       |
| --------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 0:00–0:25 | Hero och sektionerna                       | Fiktivt backendtema, fem talare, fem programpunkter och tre biljetter.                                         |
| 0:25–1:00 | Dra fönstret mellan desktop, tablet, mobil | Grid: tre/två/ett talarkort. Flexbox: navigering. Mobilmeny och sidankare.                                     |
| 1:00–1:40 | Hovra ett talarkort, tabba till dess länk  | `:hover` och `:focus-within` visar samma extrainformation.                                                     |
| 1:40–2:20 | Öppna CSS-källan                           | `+` ger linjer mellan syskon, `:nth-child(even)` alternerar rader, `[data-featured]::before` markerar biljett. |
| 2:20–3:00 | Tema och avslutning                        | Variabler, `prefers-color-scheme`, reducerad rörelse, egna fokusmarkeringar.                                   |

## Kod du ska kunna förklara

- `.speaker-grid`: Grid beskriver kolumner. `minmax(0, 1fr)` gör att innehållet får krympa.
- `.site-nav`: Flexbox hanterar en rad länkar med radbrytning.
- `.programme__item + .programme__item`: bara en rad som följs direkt av samma typ får en överkant.
- `.speaker-card:is(:hover, :focus-within)`: musen eller fokus i ett barn aktiverar kortet.
- `.ticket-card[data-featured='true']::before`: ett data-attribut väljer kortet och ett pseudo-element visar en etikett.
- `@keyframes arrive`: animation för introduktionen. Reducerad rörelse stänger av den.
- `@layer components`: egna BEM-klasser samlas i ramverkets komponentlager.

## Om du får en fråga du inte kan svara på

Säg vad du vet, visa den aktuella regeln och resonera. Påstå inte att du skrivit eller förstått
något själv om du inte kan förklara det. AI har hjälpt till; övningen är att förstå lösningen.

## Portfolion, om den också efterfrågas

Öppna `/portfolio/` från övningssidan. Beskriv fokus på systemutveckling, fyra projekt,
responsiv layout, kontaktformulärets mejlutkast och den sparade designen. Kursens uttryckliga
treminutersdemo gäller konferensuppgiften, så börja med den.
