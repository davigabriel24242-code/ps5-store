# ps5-store

Catalogo de homebrew nativo para PS5 7.00-13.60.

- sources.json - repos monitorados
- apps/TITLEID.json - um record por app
- index.json - lista leve para o front
- store_catalog.json - agregado completo

Rebuild diario via GitHub Actions.

## Rodar local

pip install -r requirements.txt
python scripts/catalog_builder.py