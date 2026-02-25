import os

def print_class_names(train_dir):
    # List all folders in the train directory
    class_names = sorted([
        folder for folder in os.listdir(train_dir)
        if os.path.isdir(os.path.join(train_dir, folder))
    ])
    
    print("Number of classes:", len(class_names))
    print("Class names:")
    for name in class_names:
        print(name)

# Example usage
train_path = "Image_Classification/sports-classification/train"
print_class_names(train_path)
