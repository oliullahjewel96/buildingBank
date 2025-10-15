using Microsoft.AspNetCore.Mvc;
using System.Transactions;
using BankWebApp.Models;

namespace BankWebApp.Controllers
{
    public class AdminController : Controller
    {
        // inside AdminController class (top-level, not inside a method)
        private static AdminProfile _profileStore = new AdminProfile(
            name: "Admin Aisha",
            email: "admin@bank.local",
            phone: "+61 400 000 000",
            profileImageUrl: "https://via.placeholder.com/96"
        );

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Users()
        {
            var users = new List<AdminUser>();
            users.Add(new AdminUser(1, "Aisha", "aisha@bank.local", "Active"));
            users.Add(new AdminUser(2, "Neerat", "neerat@bank.local", "Active"));
            users.Add(new AdminUser(3, "Oli", "oli@bank.local", "Active"));

            return View(users);
        }

        public IActionResult Transactions()
        {
            var transactions = new List<BankTransaction>();
            transactions.Add(new BankTransaction("TX1001", "Aisha", 120.50m, DateTime.Parse("2025-10-01")));
            transactions.Add(new BankTransaction("TX1002", "Neerat", -40.00m, DateTime.Parse("2025-10-02")));
            transactions.Add(new BankTransaction("TX1003", "Oli", 300.00m, DateTime.Parse("2025-10-03")));

            return View(transactions);
        }

        // GET: /Admin/Profile
        [HttpGet]
        public IActionResult Profile()
        {
            // Mock data for now; later load from your DB/API
            var profile = new AdminProfile(
                name: "Admin Aisha",
                email: "admin@bank.local",
                phone: "+61 400 000 000",
                profileImageUrl: "https://via.placeholder.com/96"
            );

            return View(profile);
        }

        // POST: /Admin/UpdateProfile
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult UpdateProfile(AdminProfile form)
        {
            if (!ModelState.IsValid)
            {
                return View("Profile", form);
            }

            // TODO: save form.Name, form.Email, form.Phone, form.ProfileImageUrl via API/DB
            TempData["ProfileMessage"] = "Profile updated.";
            return RedirectToAction("Profile");
        }

        // POST: /Admin/ChangePassword
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ChangePassword(ChangePassword form)
        {
            if (string.IsNullOrWhiteSpace(form.NewPassword) ||
                form.NewPassword != form.ConfirmNewPassword)
            {
                ModelState.AddModelError(string.Empty, "Passwords do not match.");
                // Re-show profile page with the current profile data
                var profile = new AdminProfile("Admin Aisha", "admin@bank.local", "+61 400 000 000", "https://via.placeholder.com/96");
                ViewBag.PasswordError = "Passwords do not match.";
                return View("Profile", profile);
            }

            // TODO: call your auth service to change password securely
            TempData["PasswordMessage"] = "Password changed.";
            return RedirectToAction("Profile");
        }
    }
}
