-- 创建模板表
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  config JSONB NOT NULL,
  preview_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 授权访问
GRANT SELECT ON templates TO anon;
GRANT ALL ON templates TO authenticated;

-- 插入示例模板
INSERT INTO templates (name, category, config, preview_url) VALUES
('生日祝福', 'birthday', '{"backgroundColor": "#FFE4E1", "textColor": "#FF6B9D", "fontSize": 24, "animation": "fadeIn", "duration": 60}', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=birthday%20celebration%20background%20with%20balloons%20and%20cake%20warm%20pink%20theme&image_size=landscape_16_9'),
('节日祝福', 'holiday', '{"backgroundColor": "#FFF0F5", "textColor": "#FF1493", "fontSize": 22, "animation": "slideUp", "duration": 75}', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=festive%20holiday%20background%20with%20lights%20and%20decorations%20warm%20pink%20theme&image_size=landscape_16_9'),
('日常问候', 'daily', '{"backgroundColor": "#FFFAFA", "textColor": "#DB7093", "fontSize": 20, "animation": "zoomIn", "duration": 90}', 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=warm%20daily%20greeting%20background%20with%20flowers%20and%20soft%20colors%20pink%20theme&image_size=landscape_16_9');