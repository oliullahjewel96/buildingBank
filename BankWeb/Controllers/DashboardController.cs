using Microsoft.AspNetCore.Mvc;

namespace BankWeb.Controllers
{
    public class DashboardController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
