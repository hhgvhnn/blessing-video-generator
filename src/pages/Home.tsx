import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Heart, Play, Gift, Sparkles } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Heart className="w-8 h-8 text-pink-500" />,
      title: '个性化祝福',
      description: '为特别的TA定制专属祝福视频'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-pink-500" />,
      title: '精美模板',
      description: '多种主题模板，满足不同场合需求'
    },
    {
      icon: <Gift className="w-8 h-8 text-pink-500" />,
      title: '简单制作',
      description: '只需几分钟，轻松制作精美视频'
    }
  ];

  const templates = [
    {
      id: 1,
      name: '生日祝福',
      category: 'birthday',
      preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=birthday%20celebration%20background%20with%20balloons%20and%20cake%20warm%20pink%20theme&image_size=landscape_16_9'
    },
    {
      id: 2,
      name: '节日祝福',
      category: 'holiday',
      preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=festive%20holiday%20background%20with%20lights%20and%20decorations%20warm%20pink%20theme&image_size=landscape_16_9'
    },
    {
      id: 3,
      name: '日常问候',
      category: 'daily',
      preview: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20daily%20greeting%20background%20with%20flowers%20and%20soft%20colors%20pink%20theme&image_size=landscape_16_9'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-pink-100 p-4 rounded-full">
              <Heart className="w-12 h-12 text-pink-600" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            制作专属
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-600">
              祝福视频
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            为亲人制作个性化祝福视频，让每一份祝福都充满温度和心意
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/create')}
              className="px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              开始制作
            </Button>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}
            >
              查看模板
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            为什么选择我们
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-center mb-4">
                  <div className="bg-pink-100 p-3 rounded-full">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Preview Section */}
      <section id="templates" className="py-16 px-4 bg-pink-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            精美模板预览
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video bg-gray-200">
                  <img 
                    src={template.preview} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {template.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    适合{template.name}场合的温馨祝福
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/create')}
                  >
                    使用此模板
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-pink-500 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            开始制作你的第一个祝福视频
          </h2>
          <p className="text-pink-100 mb-8 text-lg">
            简单几步，就能制作出充满心意的祝福视频
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => navigate('/create')}
            className="px-8"
          >
            立即开始
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;