import Navbar from "@/components/Navbar";
import PlanCard from "@/components/PlanCard";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { usePlanFormatter } from "@/hooks/usePlanFormatter"; // Importando o hook

const Index = () => {
  const { formatPrice, formatSales } = usePlanFormatter(); // Usando o hook

  const plans = [
    {
      title: "NET FAMÍLIA",
      category: "Plano Premium",
      price: 50.99,
      mega: 50,
      sales: 1200,
      features: [
        { text: "Passaporte Américas para usar seu celular no exterior" },
        { text: "GB para redes sociais e vídeos" },
        { text: "WhatsApp ilimitado" },
        { text: "Internet de uso livre" }
      ],
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=500"
    },
    {
      title: "NET CONTROLE",
      category: "Plano Essencial",
      price: 100.99,
      mega: 100,
      sales: 800,
      features: [
        { text: "5G mais rápido do Brasil" },
        { text: "Ligações ilimitadas" },
        { text: "YouTube ilimitado" },
        { text: "+2GB bônus todo mês" }
      ],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard 
              key={index} 
              {...plan} 
              isPopular={index === 0}
              className="bg-white transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              buttonClassName="bg-orange-500 hover:bg-orange-600 text-white" // Alterado para laranja
              salesText={formatSales(plan.sales)}  // Usando a função formatSales
              price={formatPrice(plan.price)}  // Usando a função formatPrice
            />
          ))}
        </div>
      </main>
      
      <div className="fixed bottom-6 right-6 animate-bounce">
        <a 
          href={`https://wa.me/5538998622897?text=${encodeURIComponent("Olá! Gostaria de suporte.")}`}
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
            <MessageCircle className="w-8 h-8" />
          </Button>
        </a>
      </div>
    </div>
  );
};

export default Index;
