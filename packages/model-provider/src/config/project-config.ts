import { modelConfig } from "../../../../configs/model.config";
import type { ModelConfig } from "../types/config";

/**
 * 读取项目级默认模型配置
 *
 * 为什么单独抽这个文件：
 * - 避免在 resolve-model-config 里直接写死导入路径
 * - 后面如果项目配置来源变了，只需要改这一处
 * - 也方便以后做测试替换
 */
export function getProjectModelConfig(): Partial<ModelConfig> {
  return modelConfig;
}
