from django.views.generic import TemplateView

# ======= Template View ======= #
class IndexView(TemplateView):
    """ صفحه اصلی """
    
    template_name = "home/index.html"
