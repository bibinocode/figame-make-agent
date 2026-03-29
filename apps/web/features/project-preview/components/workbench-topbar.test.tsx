import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { WorkbenchTopbar } from "./workbench-topbar";

describe("WorkbenchTopbar", () => {
  // 这条测试是为了锁住页面级工作台骨架，避免后续重构时把顶部全局工具栏又裁掉。
  it("应该展示项目标题和发布操作", () => {
    render(<WorkbenchTopbar projectTitle="智能体项目工作台" />);

    expect(screen.getByText("智能体项目工作台")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "发布" })).toBeInTheDocument();
  });
});
