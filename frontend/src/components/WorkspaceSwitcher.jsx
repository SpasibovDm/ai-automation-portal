import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

import Badge from "./Badge";
import { ChevronDownIcon } from "./Icons";
import { useWorkspace } from "../context/WorkspaceContext";

const WorkspaceSwitcher = ({ className = "" }) => {
  const { workspace, workspaces, switchWorkspace, userRole } = useWorkspace();

  return (
    <Menu as="div" className={`relative ${className}`}>
      <Menu.Button className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${workspace.color} text-xs font-semibold text-white`}
        >
          {workspace.avatar}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-xs uppercase tracking-[0.22em] text-slate-400 dark:text-slate-500">
            Workspace
          </span>
          <span className="block max-w-[140px] truncate text-sm font-semibold">{workspace.name}</span>
        </span>
        <ChevronDownIcon className="h-4 w-4 text-slate-400" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-150"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-120"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Menu.Items className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl focus:outline-none dark:border-slate-700 dark:bg-slate-900">
          <div className="px-3 pb-2 pt-1 text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-200">{workspace.name}</p>
            <p>Role: {userRole}</p>
          </div>
          {workspaces.map((item) => (
            <Menu.Item key={item.id}>
              {({ active }) => (
                <button
                  type="button"
                  onClick={() => switchWorkspace(item.id)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition ${
                    active ? "bg-slate-100 dark:bg-slate-800" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-xs font-semibold text-white`}
                    >
                      {item.avatar}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Isolated data scope</p>
                    </div>
                  </div>
                  <Badge variant={workspace.id === item.id ? "success" : "default"}>{item.userRole}</Badge>
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default WorkspaceSwitcher;
