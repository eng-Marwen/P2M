## AI Models Folder

This folder stores the AI model files used by the `aimicroservice`.

On startup, the service checks whether required models are available. If any model is missing, it downloads it from the configured Google Drive URL(s) and saves it in this folder.

Expected files include:

- `sale_model.joblib`
- `rent_model.joblib`
- `house_model_snd.pth`
