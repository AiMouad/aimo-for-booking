import os

base_dir = r"c:\Users\pc\Desktop\ING_4\aimo booing\reservation_frontend"
src_dir = os.path.join(base_dir, "src")

directories = [
    "components/common",
    "components/layout",
    "components/features",
    "pages/client",
    "pages/worker",
    "pages/owner",
    "pages/auth",
    "services",
    "hooks",
    "context",
    "utils"
]

files = {
    "components/common": ["Button.jsx", "Card.jsx", "Input.jsx", "Modal.jsx", "Loader.jsx", "ErrorBoundary.jsx"],
    "components/layout": ["Navbar.jsx", "Sidebar.jsx", "Footer.jsx", "Layout.jsx"],
    "components/features": ["ServiceCard.jsx", "ReservationForm.jsx", "Calendar.jsx", "Chatbot.jsx"],
    "pages/client": ["Home.jsx", "Services.jsx", "ServiceDetail.jsx", "MyReservations.jsx", "Profile.jsx"],
    "pages/worker": ["Dashboard.jsx", "Schedule.jsx", "Reservations.jsx"],
    "pages/owner": ["Dashboard.jsx", "Services.jsx", "Workers.jsx", "Reservations.jsx", "Analytics.jsx"],
    "pages/auth": ["Login.jsx", "Register.jsx"],
    "pages": ["NotFound.jsx"],
    "services": ["api.js", "auth.service.js", "service.service.js", "reservation.service.js", "chatbot.service.js"],
    "hooks": ["useAuth.js", "useServices.js", "useReservations.js", "useChatbot.js"],
    "context": ["AuthContext.jsx", "ThemeContext.jsx"],
    "utils": ["constants.js", "helpers.js", "validators.js"],
}

# Create directories
for d in directories:
    os.makedirs(os.path.join(src_dir, d), exist_ok=True)

# Create files inside src folder
for d, f_list in files.items():
    for f in f_list:
        file_path = os.path.join(src_dir, d, f)
        if not os.path.exists(file_path):
            with open(file_path, "w", encoding="utf-8") as f_obj:
                f_obj.write("")

# Create root files
root_files = ["tailwind.config.js", "Dockerfile"]
for f in root_files:
    file_path = os.path.join(base_dir, f)
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f_obj:
            f_obj.write("")

# Let's ensure src/index.js, App.jsx, index.css exist
for f in ["index.js", "App.jsx", "index.css"]:
    file_path = os.path.join(src_dir, f)
    if not os.path.exists(file_path):
        with open(file_path, "w", encoding="utf-8") as f_obj:
            f_obj.write("")

# Clean up default vite files that user didn't ask for (like main.jsx), unless user wants to keep them.
# The user wants exactly the tree specified.
print("Scaffolding complete.")
