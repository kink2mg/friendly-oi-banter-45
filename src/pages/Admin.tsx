import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NavbarConfig from "@/components/admin/NavbarConfig";
import PlansConfig from "@/components/admin/PlansConfig";
import AccessoryForm from "@/components/admin/AccessoryForm";
import NewsForm from "@/components/admin/NewsForm";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Edit } from "lucide-react";

interface Accessory {
  id: string;
  nome: string;
  preco: number;
  precoAntigo?: number;
  descricao: string;
  imagem: string;
  videoUrl?: string;
  categoria: string;
  emPromocao: boolean;
  quantidadeVendas: number;
  created_at: string;
  updated_at: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  image: string;
  videoUrl?: string;
  category: string;
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAccessoryForm, setShowAccessoryForm] = useState(false);
  const [showNewsForm, setShowNewsForm] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("No session found, redirecting to login");
          toast({
            title: "Acesso Negado",
            description: "Você precisa fazer login primeiro.",
            variant: "destructive",
          });
          navigate("/auth");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          throw profileError;
        }

        if (!profile || profile.role !== "admin") {
          console.log("User is not admin, redirecting");
          toast({
            title: "Acesso Negado",
            description: "Você não tem permissão para acessar esta página.",
            variant: "destructive",
          });
          navigate("/");
          return;
        }

        // Load existing data
        await Promise.all([
          fetchAccessories(),
          fetchNews()
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking admin access:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao verificar suas permissões.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);

  const fetchAccessories = async () => {
    try {
      const { data, error } = await supabase
        .from("accessories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const formattedAccessories: Accessory[] = data.map(item => ({
        id: item.id,
        nome: item.nome,
        preco: item.preco,
        precoAntigo: item.preco_antigo,
        descricao: item.descricao,
        imagem: item.imagem,
        videoUrl: item.video_url,
        categoria: item.categoria,
        emPromocao: item.em_promocao,
        quantidadeVendas: item.quantidade_vendas,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
      
      setAccessories(formattedAccessories);
    } catch (error) {
      console.error("Error fetching accessories:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os acessórios.",
        variant: "destructive",
      });
    }
  };

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedNews: NewsItem[] = data.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        date: new Date(item.created_at).toISOString().split('T')[0],
        image: item.image_url || '',
        videoUrl: item.video_url,
        category: item.category || ''
      }));

      setNews(formattedNews);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notícias.",
        variant: "destructive",
      });
    }
  };

  const handleAddAccessory = async (newAccessory: Omit<Accessory, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase
        .from("accessories")
        .insert([{
          nome: newAccessory.nome,
          preco: newAccessory.preco,
          preco_antigo: newAccessory.precoAntigo,
          descricao: newAccessory.descricao,
          imagem: newAccessory.imagem,
          video_url: newAccessory.videoUrl,
          categoria: newAccessory.categoria,
          em_promocao: newAccessory.emPromocao,
          quantidade_vendas: newAccessory.quantidadeVendas
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedAccessory: Accessory = {
        id: data.id,
        nome: data.nome,
        preco: data.preco,
        precoAntigo: data.preco_antigo,
        descricao: data.descricao,
        imagem: data.imagem,
        videoUrl: data.video_url,
        categoria: data.categoria,
        emPromocao: data.em_promocao,
        quantidadeVendas: data.quantidade_vendas,
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setAccessories([formattedAccessory, ...accessories]);
      setShowAccessoryForm(false);
      toast({
        title: "Sucesso",
        description: "Acessório adicionado com sucesso!"
      });
    } catch (error) {
      console.error("Error adding accessory:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o acessório.",
        variant: "destructive",
      });
    }
  };

  const handleAddNews = async (newNews: Omit<NewsItem, "id">) => {
    try {
      const { data, error } = await supabase
        .from("news")
        .insert([{
          title: newNews.title,
          content: newNews.content,
          image_url: newNews.image,
          video_url: newNews.videoUrl,
          category: newNews.category
        }])
        .select()
        .single();

      if (error) throw error;

      const formattedNews: NewsItem = {
        id: data.id,
        title: data.title,
        content: data.content,
        date: new Date(data.created_at).toISOString().split('T')[0],
        image: data.image_url || '',
        videoUrl: data.video_url,
        category: data.category || ''
      };

      setNews([formattedNews, ...news]);
      setShowNewsForm(false);
      toast({
        title: "Sucesso",
        description: "Notícia adicionada com sucesso!"
      });
    } catch (error) {
      console.error("Error adding news:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a notícia.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Painel Administrativo</h1>

        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList className="w-full flex-wrap">
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="navbar">Navbar</TabsTrigger>
            <TabsTrigger value="plans">Planos</TabsTrigger>
            <TabsTrigger value="accessories">Acessórios</TabsTrigger>
            <TabsTrigger value="news">Notícias</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SiteSettingsForm />
          </TabsContent>

          <TabsContent value="navbar">
            <NavbarConfig />
          </TabsContent>

          <TabsContent value="plans">
            <PlansConfig />
          </TabsContent>

          <TabsContent value="accessories">
            <div className="space-y-4">
              <Button onClick={() => setShowAccessoryForm(!showAccessoryForm)}>
                {showAccessoryForm ? "Cancelar" : "Adicionar Novo Acessório"}
              </Button>

              {showAccessoryForm && (
                <Card className="p-6">
                  <AccessoryForm onSubmit={handleAddAccessory} />
                </Card>
              )}

              <div className="grid gap-4">
                {accessories.map((accessory) => (
                  <Card key={accessory.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{accessory.nome}</h3>
                        <p className="text-gray-500">{accessory.categoria}</p>
                        <p className="text-sm mt-2">{accessory.descricao}</p>
                        <div className="mt-2">
                          <span className="font-bold">R$ {accessory.preco.toFixed(2)}</span>
                          {accessory.precoAntigo && (
                            <span className="text-gray-500 line-through ml-2">
                              R$ {accessory.precoAntigo.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="news">
            <div className="space-y-4">
              <Button onClick={() => setShowNewsForm(!showNewsForm)}>
                {showNewsForm ? "Cancelar" : "Adicionar Nova Notícia"}
              </Button>

              {showNewsForm && (
                <Card className="p-6">
                  <NewsForm onSubmit={handleAddNews} />
                </Card>
              )}

              <div className="grid gap-4">
                {news.map((item) => (
                  <Card key={item.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{item.title}</h3>
                        <p className="text-gray-500">{item.category}</p>
                        <p className="text-sm mt-2">{item.content}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;