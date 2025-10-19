using Microsoft.AspNetCore.Mvc;

namespace BankWeb.Controllers
{
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Users()
        {
            return View();
        }

        public IActionResult Transactions()
        {
            return View();
        }

        public IActionResult Logs()
        {
            return View();
        }
    }
}
