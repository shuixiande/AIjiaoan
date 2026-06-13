/**
 * 提示词构建服务
 */

/**
 * 根据教案表单数据构建完整的 AI 提示词
 */
export function buildPrompt(formData) {
  const {
    courseName: course,
    topicName: topic,
    lessonType: type,
    lessonHours: hours,
    className: cls,
    teacherName: teacher,
    teachDate: date,
    objectiveType: objType,
    customDims,
    moduleA: modAenabled,
    moduleAName: modAname,
    moduleB: modBenabled,
    moduleBName: modBname,
    extraReq: extra
  } = formData;

  // 确定教学目标维度
  let dims = '';
  if (objType === 'default') {
    dims = '知识与技能、过程与方法、情感态度与价值观';
  } else if (objType === 'core') {
    dims = '语言建构与运用、思维发展与提升、审美鉴赏与创造、文化传承与理解';
  } else {
    dims = (customDims || '').trim() || '知识与技能、过程与方法、情感态度与价值观';
  }
  const dimArray = dims.split('、');

  // ---- 构建提示词 ----
  let prompt = '你是一位经验丰富的教学设计专家。请严格按照以下模板格式，生成一份完整的教学设计 HTML 文档。\n\n' +
    '=== 模板 HTML 结构（必须严格逐行遵循！） ===\n\n' +
    '<!DOCTYPE html>\n' +
    '<html lang="zh-CN">\n' +
    '<head>\n' +
    '<meta charset="UTF-8">\n' +
    `<title>${course} - ${topic} 教学设计</title>\n` +
    '<style>\n' +
    '* { margin:0; padding:0; box-sizing:border-box; }\n' +
    'body { font-family:"宋体",SimSun,serif; font-size:12pt; line-height:1.5; }\n' +
    '.doc-container { width:720px; margin:0 auto; padding:15px; }\n' +
    '.title { text-align:center; font-size:16pt; font-weight:bold; margin-bottom:8px; }\n' +
    'table { width:720px; border-collapse:collapse; table-layout:fixed; }\n' +
    'td, th { border:1px solid #000; padding:4px 6px; font-size:12pt; vertical-align:top; word-wrap:break-word; }\n' +
    '.label-cell { width:90px; font-weight:bold; text-align:center; background-color:#f5f5f5; }\n' +
    '.section-title { text-align:center; font-weight:bold; background-color:#f5f5f5; }\n' +
    '.input-cell { min-height:35px; }\n' +
    '.activity-cell { width:150px; }\n' +
    '.teaching-row td { vertical-align:top; padding:6px; }\n' +
    'b, strong { font-weight:bold; }\n' +
    '</style>\n' +
    '</head>\n' +
    '<body>\n' +
    '<div class="doc-container">\n' +
    `<div class="title">《${course}》教学设计</div>\n` +
    '<table>\n\n';

  // 基础信息行
  prompt +=
    '<!-- 基础信息行 -->\n' +
    '<tr>\n' +
    `  <td class="label-cell">授课时间</td>\n` +
    `  <td colspan="2">${date}    第 __ 周    星期 __    第 __ 节</td>\n` +
    '  <td class="label-cell">课时</td>\n' +
    `  <td colspan="2">${hours} 课时</td>\n` +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">课题名称</td>\n' +
    `  <td colspan="2">${topic}</td>\n` +
    '  <td class="label-cell">课型</td>\n' +
    `  <td colspan="2">${type}</td>\n` +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">授课班级</td>\n' +
    `  <td colspan="2">${cls}</td>\n` +
    '  <td class="label-cell">授课教师</td>\n' +
    `  <td colspan="2">${teacher}</td>\n` +
    '</tr>\n\n';

  // 教学目标
  prompt +=
    '<!-- 教学目标 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">教学目标</td>\n' +
    '</tr>\n';

  for (const dim of dimArray) {
    const d = dim.trim();
    prompt +=
      '<tr>\n' +
      `  <td class="label-cell">${d}</td>\n` +
      '  <td colspan="5" class="input-cell">\n' +
      `    （请 AI 根据${course}中${topic}的内容，针对"${d}"维度，列出 2~4 条具体可测量的教学目标，核心概念用 <strong> 加粗）\n` +
      '  </td>\n' +
      '</tr>\n';
  }

  // 教学重点
  prompt +=
    '\n<!-- 教学重点 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">教学重点</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">教学重点</td>\n' +
    '  <td colspan="5" class="input-cell">（请 AI 根据课题内容填写教学重点，编号列出 2-3 条，核心概念用 <strong> 加粗）</td>\n' +
    '</tr>\n\n';

  // 教学难点
  prompt +=
    '<!-- 教学难点 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">教学难点</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">教学难点</td>\n' +
    '  <td colspan="5" class="input-cell">（请 AI 根据课题内容填写教学难点，编号列出 2-3 条，核心概念用 <strong> 加粗）</td>\n' +
    '</tr>\n\n';

  // 教法与学法
  prompt +=
    '<!-- 教法与学法 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">教法与学法</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">教法</td>\n' +
    '  <td colspan="5" class="input-cell">（请 AI 列出至少 2-3 种教学方法，如讲授法、演示法、实验法、讨论法、启发式教学、任务驱动法等，简要说明如何使用）</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">学法</td>\n' +
    '  <td colspan="5" class="input-cell">（请 AI 列出至少 2-3 种学习方法，如自主探究法、合作学习法、观察比较法、练习巩固法等，简要说明如何使用）</td>\n' +
    '</tr>\n\n';

  // 可选模块
  if (modAenabled) {
    prompt +=
      '<!-- 可选模块A -->\n' +
      '<tr>\n' +
      `  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">${modAname}</td>\n` +
      '</tr>\n' +
      '<tr>\n' +
      `  <td class="label-cell">${modAname}</td>\n` +
      `  <td colspan="5" class="input-cell">（请 AI 根据${course}学科特点，为"${modAname}"设计 2-3 条融入要点，自然融入不强行说教，每个要点用 <strong> 标出小标题）</td>\n` +
      '</tr>\n\n';
  }
  if (modBenabled) {
    prompt +=
      '<!-- 可选模块B -->\n' +
      '<tr>\n' +
      `  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">${modBname}</td>\n` +
      '</tr>\n' +
      '<tr>\n' +
      `  <td class="label-cell">${modBname}</td>\n` +
      `  <td colspan="5" class="input-cell">（请 AI 根据${course}学科特点，为"${modBname}"设计 2-3 条要点，每个要点用 <strong> 标出小标题）</td>\n` +
      '</tr>\n\n';
  }

  // 教学准备
  prompt +=
    '<!-- 教学准备 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">教学准备</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">教学准备</td>\n' +
    '  <td colspan="5" class="input-cell">\n' +
    `    <strong>教师</strong>：（请 AI 列出教师需准备的多媒体课件、教具、实验器材、模型、学案等）<br>\n` +
    '    <strong>学生</strong>：（请 AI 列出学生需准备的预习要求、复习内容、工具等）\n' +
    '  </td>\n' +
    '</tr>\n\n';

  // 板书设计
  prompt +=
    '<!-- 板书设计 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">板书设计</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">板书设计</td>\n' +
    "  <td colspan=\"5\" class=\"input-cell\" style=\"font-family:'宋体',SimSun,serif;white-space:pre-line;line-height:1.8;\">\n" +
    '（请 AI 设计板书，格式如下：第一行是课题标题，然后用 ───────────────────── 分隔，之后是大标题和知识点，核心公式/概念用 <strong> 加粗）\n' +
    '  </td>\n' +
    '</tr>\n\n';

  // 教学实施
  prompt +=
    '<!-- 教学实施 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell" style="width:90px;font-weight:bold;text-align:center;background-color:#f5f5f5;">教学环节</td>\n' +
    '  <td class="label-cell" colspan="2" style="font-weight:bold;text-align:center;background-color:#f5f5f5;">教学内容</td>\n' +
    '  <td class="label-cell activity-cell" style="font-weight:bold;text-align:center;background-color:#f5f5f5;">教师活动</td>\n' +
    '  <td class="label-cell activity-cell" style="font-weight:bold;text-align:center;background-color:#f5f5f5;">学生活动</td>\n' +
    '  <td class="label-cell activity-cell" style="font-weight:bold;text-align:center;background-color:#f5f5f5;">设计意图</td>\n' +
    '</tr>\n';

  const steps = ['一、复习导入', '二、新知探究', '三、深化应用', '四、巩固练习', '五、拓展延伸', '六、课堂小结'];
  for (const step of steps) {
    prompt +=
      '<tr class="teaching-row">\n' +
      `  <td style="font-weight:bold;">${step}<br>（__ 分钟）</td>\n` +
      '  <td colspan="2">\n' +
      '    （请 AI 填写本环节的教学内容详细描述）<br>\n' +
      '    <strong>（核心概念/公式/关键知识点加粗）</strong>\n' +
      '  </td>\n' +
      '  <td>（请 AI 填写教师在本环节的具体活动和引导方式）</td>\n' +
      '  <td>（请 AI 填写学生在本环节的学习活动和任务）</td>\n' +
      '  <td>（请 AI 说明本环节的设计意图和目标）</td>\n' +
      '</tr>\n';
  }

  // 课堂小结
  prompt +=
    '\n<!-- 课堂小结 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">课堂小结</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">课堂小结</td>\n' +
    '  <td colspan="5" class="input-cell">\n' +
    '    （请 AI 用"本节课学习了以下核心知识："开头，编号列出 3-5 条核心知识点，每条用 <strong> 加粗）\n' +
    '  </td>\n' +
    '</tr>\n\n';

  // 作业设计
  prompt +=
    '<!-- 作业设计 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">作业设计</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">作业设计</td>\n' +
    '  <td colspan="5" class="input-cell">\n' +
    '    <strong>1. 基础巩固</strong><br>\n' +
    '    · （请 AI 设计必做基础题）<br><br>\n' +
    '    <strong>2. 拓展提高</strong><br>\n' +
    '    · （请 AI 设计选做拓展题）<br><br>\n' +
    '    <strong>3. 思考探究</strong><br>\n' +
    '    · （请 AI 设计开放性问题）\n' +
    '  </td>\n' +
    '</tr>\n\n';

  // 教学反思
  prompt +=
    '<!-- 教学反思 -->\n' +
    '<tr>\n' +
    '  <td class="label-cell section-title" colspan="6" style="text-align:center;font-weight:bold;background-color:#f5f5f5;">教学反思</td>\n' +
    '</tr>\n' +
    '<tr>\n' +
    '  <td class="label-cell">教学反思</td>\n' +
    '  <td colspan="5" class="input-cell">\n' +
    '    <strong>预设问题及预案：</strong><br>\n' +
    '    1. （请 AI 列出可能遇到的问题及处理方案）<br>\n' +
    '    2. （请 AI 列出可能遇到的问题及处理方案）<br><br>\n' +
    '    <strong>亮点设计：</strong><br>\n' +
    '    · （请 AI 说明本教学设计的创新和特色）\n' +
    '  </td>\n' +
    '</tr>\n\n';

  prompt +=
    '</table>\n' +
    '</div>\n' +
    '</body>\n' +
    '</html>\n\n';

  // 核心要求
  prompt +=
    '=== 核心要求 ===\n' +
    `1. 将上面模板中所有"（请 AI ...）"的占位内容，替换为真实的、符合${course}（关于${topic}）的教学内容。\n` +
    '2. 必须严格保持 HTML 结构和 CSS class 不变，不要增删任何 <tr> 行，教学实施部分固定生成 6 个环节。\n' +
    '3. 核心概念、公式、重要知识点必须用 <strong> 标签加粗。\n' +
    `4. 时间分配合理，总时长约${hours * 45}分钟（${hours}课时），每个教学环节标注分钟数。\n` +
    '5. 教法至少 2-3 种，学法至少 2-3 种。\n' +
    '6. 板书设计层次清晰，使用 ───────────────────── 作为分隔线。\n' +
    '7. 作业设计必须包含三个层次：基础巩固（必做）、拓展提高（选做）、思考探究（开放）。\n' +
    (extra ? `8. 额外要求：${extra}\n` : '') +
    '\n请直接输出完整的 HTML 代码，不要添加任何代码块标记或解释说明。';

  return prompt;
}