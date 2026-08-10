import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

export function LoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { login } = useAuth();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!pw || busy) return;
    setBusy(true);
    setErr(false);
    const ok = await login(pw);
    setBusy(false);
    if (ok) {
      setPw("");
      onClose();
    } else {
      setErr(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">管理员登录</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          请输入管理员密码以编辑内容。
        </p>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder="管理员密码"
          className="mt-4 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {err && (
          <p className="mt-2 text-sm text-destructive">密码错误，请重试。</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            取消
          </Button>
          <Button onClick={submit} disabled={busy || !pw}>
            {busy ? "登录中…" : "登录"}
          </Button>
        </div>
      </div>
    </div>
  );
}
