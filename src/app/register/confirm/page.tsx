import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#34c759]/[0.12] rounded-2xl mb-6">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight mb-3">이메일을 확인해 주세요</h1>
        <p className="text-[#6e6e73] text-[15px] leading-relaxed mb-8 max-w-sm">
          가입하신 이메일로 인증 링크를 보냈습니다.<br />
          링크를 클릭하면 가입이 완료됩니다.
        </p>
        <Link
          href="/login"
          className="inline-block bg-[#0071e3] text-white px-8 py-3 rounded-full font-medium text-[15px] hover:bg-[#0077ed] transition-all"
        >
          로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
