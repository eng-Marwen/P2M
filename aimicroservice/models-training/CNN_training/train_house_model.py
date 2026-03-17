#for model training : run once or occasionally this is training script
# Core PyTorch library (tensors, autograd, model utilities)
import torch
# Neural-network layers and loss functions (e.g., Linear, CrossEntropyLoss)
import torch.nn as nn
# Computer-vision datasets, pretrained models, and image transforms
from torchvision import datasets, models, transforms
# Utility to iterate datasets in mini-batches
from torch.utils.data import DataLoader
# Progress bar for loops
from tqdm import tqdm

# ImageNet channel statistics used by pretrained ResNet models
imagenet_mean = [0.485, 0.456, 0.406]
imagenet_std = [0.229, 0.224, 0.225]

# Training preprocessing: includes augmentation + normalization
train_transform = transforms.Compose([
    transforms.Resize((224, 224)),               # Resize to ResNet18 input size
    transforms.RandomHorizontalFlip(),            # Augment only training images
    transforms.ToTensor(),                        # Convert PIL image to tensor in [0,1]
    transforms.Normalize(imagenet_mean, imagenet_std)  # Match pretrained feature scale
])

# Validation/Test preprocessing: deterministic (no random augmentation)
test_transform = transforms.Compose([
    transforms.Resize((224, 224)),               # Same spatial size as training
    transforms.ToTensor(),                        # Convert to tensor
    transforms.Normalize(imagenet_mean, imagenet_std)  # Same normalization as training
])

# Create training dataset with training transform (includes augmentation)
train_dataset = datasets.ImageFolder("data/train", transform=train_transform)
# Create test dataset with deterministic transform (no random flip)
test_dataset = datasets.ImageFolder("data/test", transform=test_transform)

# DataLoader wraps dataset to provide mini-batches and optional shuffling
train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)   # Shuffle training data every epoch
test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)    # No shuffle needed for evaluation

# Show discovered class names to verify labels are correct
print(train_dataset.classes)  # Example: ['house', 'not_house']
# Show test class names (must match train class order)
print(test_dataset.classes)   # Example: ['house', 'not_house']
# Show explicit mapping from class name to numeric index
print(train_dataset.class_to_idx)  # Example: {'house': 0, 'not_house': 1}

# Load ResNet18 with pretrained ImageNet weights (new torchvision API)
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
# Number of input features expected by the current final fully-connected layer
num_features = model.fc.in_features
# Replace last classification layer to output 2 logits: house / not_house
model.fc = nn.Linear(num_features, 2)

# Define loss: compares predicted class logits with true labels
criterion = nn.CrossEntropyLoss()
# Define optimizer: updates model weights using Adam algorithm
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Number of full passes over training dataset
num_epochs = 7

# Training loop over epochs
for epoch in range(num_epochs):
    model.train()  # Put model in training mode (enables dropout/batchnorm updates)
    running_loss = 0  # Sum of batch losses for this epoch
    correct = 0       # Number of correct predictions so far
    total = 0         # Number of samples seen so far

    # Create a progress bar over training batches
    pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}")
    for images, labels in pbar:  # Get one mini-batch of images and labels
        outputs = model(images)  # Forward pass: compute logits for each class
        loss = criterion(outputs, labels)  # Compute classification loss

        optimizer.zero_grad()  # Clear old gradients from previous step
        loss.backward()        # Backpropagation: compute new gradients
        optimizer.step()       # Apply gradient update to model parameters

        # Update running metrics
        running_loss += loss.item()
        _, predicted = torch.max(outputs, 1)            # Predicted class index for each sample
        total += labels.size(0)                         # Add batch size to total sample count
        correct += (predicted == labels).sum().item()   # Count correct predictions in this batch
        batch_loss = running_loss / len(pbar)           # Approx average loss so far in this epoch
        batch_acc = correct / total                     # Accuracy so far in this epoch

        # Show live metrics on progress bar
        pbar.set_postfix(Loss=f"{batch_loss:.4f}", Accuracy=f"{batch_acc:.4f}")

    # End-of-epoch summary metrics
    epoch_loss = running_loss / len(train_loader)  # True epoch average loss
    epoch_acc = correct / total                    # True epoch accuracy
    print(f"Epoch {epoch+1} finished - Loss: {epoch_loss:.4f}, Accuracy: {epoch_acc:.4f}")

    # Switch to evaluation mode (important for dropout/batchnorm behavior)
model.eval()

correct = 0  # Number of correct predictions on test set
total = 0    # Total number of tested samples

# Disable gradient computation for faster and memory-efficient inference
with torch.no_grad():
    for images, labels in test_loader:             # Iterate through test mini-batches
        outputs = model(images)                    # Forward pass
        _, predicted = torch.max(outputs, 1)       # Convert logits to predicted class index
        total += labels.size(0)                    # Add number of samples in batch
        correct += (predicted == labels).sum().item()  # Add number of correct predictions

accuracy = correct / total  # Final test accuracy
print("Test accuracy:", accuracy)

# Import evaluation metrics utilities from scikit-learn
from sklearn.metrics import confusion_matrix, classification_report, f1_score, precision_score, recall_score

model.eval()  # Ensure model is in inference mode

all_labels = []  # Store all true labels from test set
all_preds = []   # Store all predicted labels from test set

# No gradients needed during evaluation
with torch.no_grad():
    for images, labels in test_loader:
        outputs = model(images)                  # Compute class logits
        _, predicted = torch.max(outputs, 1)     # Select class with max logit
        all_labels.extend(labels.cpu().numpy())  # Move true labels to CPU numpy and append
        all_preds.extend(predicted.cpu().numpy())# Move predictions to CPU numpy and append

# Compute accuracy manually from prediction lists
accuracy = (torch.tensor(all_preds) == torch.tensor(all_labels)).sum().item() / len(all_labels)
print("Test Accuracy:", accuracy)

# Build confusion matrix: rows=true class, columns=predicted class
cm = confusion_matrix(all_labels, all_preds)
print("Confusion Matrix:\n", cm)

# Build detailed per-class metrics report (precision/recall/f1/support)
report = classification_report(all_labels, all_preds)
print("Classification Report:\n", report)

# Compute macro-averaged scores (simple average across classes)
f1_macro = f1_score(all_labels, all_preds, average='macro')
precision_macro = precision_score(all_labels, all_preds, average='macro')
recall_macro = recall_score(all_labels, all_preds, average='macro')

# Display macro metrics
print(f"F1 Score (Macro): {f1_macro:.4f}")
print(f"Precision (Macro): {precision_macro:.4f}")
print(f"Recall (Macro): {recall_macro:.4f}")

# Debug helper: run inference on multiple custom images and print probabilities
from pathlib import Path
from PIL import Image

# Put your two room images in this folder or change paths below
custom_images = [
    Path("picture-lake.jpg"),
    Path("im10.jpeg"),
    Path("im11.jpeg"),
    Path("images.jpeg"),
]

model.eval()
for p in custom_images:
    if not p.exists():
        print(f"Missing file: {p}")
        continue

    img = Image.open(p).convert("RGB")
    x = test_transform(img).unsqueeze(0)

    with torch.no_grad():
        logits = model(x)
        probs = torch.softmax(logits, dim=1).squeeze(0)
        pred_idx = int(torch.argmax(probs).item())

    if "train_dataset" in globals():
        names = train_dataset.classes
    else:
        names = ["house", "not_house"]

    print(f"\nImage: {p}")
    print(f"Predicted: {names[pred_idx]}")
    for i, n in enumerate(names):
        print(f"  {n}: {probs[i].item():.4f}")

# Save only learned parameters (state_dict) to disk for later reuse
torch.save(model.state_dict(), "house_model_snd.pth")