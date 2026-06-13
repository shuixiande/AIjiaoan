/**
 * 输入验证服务
 */

export function validateForm(data, apiSource) {
  const errors = [];

  if (!data.courseName || !data.courseName.trim()) {
    errors.push('课程名称不能为空');
  }
  if (!data.topicName || !data.topicName.trim()) {
    errors.push('课题名称不能为空');
  }

  if (apiSource === 'own') {
    if (!data.apiKey || !data.apiKey.trim()) {
      errors.push('自有 API Key 不能为空');
    }
    if (!data.apiEndpoint || !data.apiEndpoint.trim()) {
      errors.push('API 地址不能为空');
    }
    if (!data.apiModel || !data.apiModel.trim()) {
      errors.push('模型名称不能为空');
    }
  }

  const hours = parseInt(data.lessonHours, 10);
  if (isNaN(hours) || hours < 1 || hours > 10) {
    errors.push('课时数必须在 1-10 之间');
  }

  const validTypes = ['新授课', '复习课', '实训课', '考核课', '讲评课'];
  if (data.lessonType && !validTypes.includes(data.lessonType)) {
    errors.push('课型无效');
  }

  if (data.objectiveType === 'custom' && (!data.customDims || !data.customDims.trim())) {
    errors.push('自定义教学目标维度不能为空');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
