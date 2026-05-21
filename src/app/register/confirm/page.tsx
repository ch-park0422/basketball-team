import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="max-w-md mx-auto mt-20 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
        <span className="text-3xl">📧</span>
      </div>
      <h1 className="text-2xl font-bold mb-2">이메일을 확인해 주세요</h1>
      <p className="text-gray-500 mb-6">
        가입하신 이메일로 인증 링크를 보냈습니다.
        <br />
        링크를 클릭하면 가입이 완료됩니다.
      </p>
      <Link
        href="/login"
        className="inline-block bg-orange-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
      >
        로그인 화면으로
      </Link>
    </div>
  );
}
