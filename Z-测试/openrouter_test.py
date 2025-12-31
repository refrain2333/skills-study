#!/usr/bin/env python3
"""OpenRouter API 测试脚本 - 精简版"""

import requests
from typing import Optional

class OpenRouterTester:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or "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"
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
    
    def _request(self, method: str, endpoint: str, **kwargs):
        """通用请求方法"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = requests.request(method, url, headers=self.headers, **kwargs)
            return response.status_code == 200, response
        except Exception as e:
            print(f"❌ 错误: {e}")
            return False, None
    
    def test_health_check(self):
        """健康检查"""
        print("🏥 测试 API 健康检查...")
        success, resp = self._request('GET', '/auth')
        if success:
            print("✅ API 连接正常")
        else:
            print(f"❌ 失败: {resp.status_code if resp else '无响应'}")
        return success
    
    def test_models_list(self):
        """获取模型列表"""
        print("\n🔍 测试获取模型列表...")
        success, resp = self._request('GET', '/models')
        if success:
            models = resp.json().get('data', [])
            print(f"✅ 成功获取 {len(models)} 个模型")
            for i, m in enumerate(models[:3]):
                print(f"   {i+1}. {m.get('id')}")
            if len(models) > 3:
                print(f"   ... 还有 {len(models) - 3} 个")
        else:
            print(f"❌ 失败: {resp.status_code if resp else '无响应'}")
        return success
    
    def test_chat_completion(self, model_id: str = "xiaomi/mimo-v2-flash:free"):
        """测试聊天"""
        print(f"\n💬 测试聊天完成 ({model_id})...")
        payload = {
            "model": model_id,
            "messages": [{"role": "user", "content": "你好，简洁介绍自己"}],
            "max_tokens": 100,
            "temperature": 0.7
        }
        success, resp = self._request('POST', '/chat/completions', json=payload)
        if success:
            content = resp.json()['choices'][0]['message']['content']
            print(f"✅ 回复: {content[:100]}")
        else:
            print(f"❌ 失败: {resp.status_code if resp else '无响应'}")
        return success

def main():
    print("🚀 OpenRouter API 测试\n" + "=" * 40)
    
    tester = OpenRouterTester()
    tests = [
        tester.test_health_check(),
        tester.test_models_list(),
        tester.test_chat_completion()
    ]
    
    print("\n" + "=" * 40)
    passed = sum(tests)
    print(f"📊 结果: {passed}/{len(tests)} 通过")
    print("🎉 全部通过！" if passed == len(tests) else "⚠️  部分失败")

if __name__ == "__main__":
    main()
