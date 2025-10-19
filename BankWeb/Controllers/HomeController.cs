using Microsoft.AspNetCore.Mvc;

namespace BankWeb.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
