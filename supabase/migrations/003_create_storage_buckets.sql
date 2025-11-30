-- 创建头像和图片存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 设置头像访问策略
CREATE POLICY "头像公开可读" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "用户可上传头像" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

-- 创建视频文件存储桶
INSERT INTO storage.buckets (id, name, public) VALUES ('videos', 'videos', true);

-- 设置视频访问策略
CREATE POLICY "视频公开可读" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "用户可上传视频" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'videos' AND auth.uid() = owner);