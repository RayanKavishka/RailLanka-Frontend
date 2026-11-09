import { useCallback, useEffect, useState } from "react";
import { getAllPayments } from "../../services/paymentService";
import axios from "axios";
import { toast } from "sonner";
import Loading from "../../components/ui/Loading";

export interface PaymentDetails {
  journey: string;
  passengerEmail: string;
  amount: number;
  payMethod: string;
  paymentDate: Date;
  paymentStatus: string;
}

export interface PaymentPagination {
  currentPage: number;
  pageSize: number;
  totalPayments: number;
  totalPages: number;
}

interface IPaymentsResponse {
  payments: PaymentDetails[];
  pagination: PaymentPagination;
}

const PaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentDetails[] | null>(null);
  const [pagination, setPagination] = useState<PaymentPagination | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);

  const fetchPaymenstPage = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllPayments(page, 7);

      if (response.status === 200) {
        const paymentRes: IPaymentsResponse = response.data.body;

        setPayments(paymentRes.payments);
        setPagination(paymentRes.pagination);
      }

    } catch (error) {
      setLoading(false);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message);
      } else {
        toast.error("Something went wrong.");
      }

    } finally {
      setLoading(false);
    }

  }, [page]);

  useEffect(() => {
    fetchPaymenstPage();
    
  }, [fetchPaymenstPage]);

  if (loading) {
    return <Loading />;
  } else {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {`Total Payments ${pagination?.totalPayments ?? 0}`}
        </h1>
        <p className="mt-1 text-[#5B6B7E]">
          Every passenger payment, with its method and status.
        </p>

        <div className="mt-6 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-[#E2E7EF] lg:bg-white lg:shadow-sm">
          <table className="block w-full text-left lg:table lg:border-collapse">
            <thead className="hidden border-b border-[#E2E7EF] bg-[#F4F6FA] lg:table-header-group">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5B6B7E]">
                  Journey
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5B6B7E]">
                  Passenger Email
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5B6B7E]">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5B6B7E]">
                  Method
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5B6B7E]">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#5B6B7E]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:table-row-group">
              {payments?.map((payment, index) => {
                const status = String(payment.paymentStatus).toUpperCase();

                return (
                  <tr
                    key={`${payment.passengerEmail}-${payment.paymentDate}-${index}`}
                    className="block rounded-3xl border border-[#E2E7EF] bg-white p-5 shadow-sm transition-colors lg:table-row lg:rounded-none lg:border-0 lg:border-b lg:p-0 lg:shadow-none lg:hover:bg-[#F4F6FA]/60"
                  >
                    <td
                      data-label="Journey"
                      className="block border-b border-[#E2E7EF] pb-3 text-left text-base font-bold lg:table-cell lg:border-b-0 lg:px-6 lg:py-4 lg:text-sm lg:font-semibold"
                    >
                      {payment.journey.replace(" - ", " → ")}
                    </td>

                    <td
                      data-label="Passenger Email"
                      className="flex items-start justify-between gap-4 py-2 text-right text-sm before:shrink-0 before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-[#5B6B7E] before:content-[attr(data-label)] lg:table-cell lg:px-6 lg:py-4 lg:text-left lg:text-[#5B6B7E] lg:before:hidden"
                    >
                      <span
                        className="min-w-0 break-all lg:block lg:max-w-[240px] lg:truncate"
                        title={payment.passengerEmail}
                      >
                        {payment.passengerEmail}
                      </span>
                    </td>

                    <td
                      data-label="Amount"
                      className="flex items-start justify-between gap-4 py-2 text-right text-sm font-bold tabular-nums text-[#006D77] before:shrink-0 before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-[#5B6B7E] before:content-[attr(data-label)] lg:table-cell lg:px-6 lg:py-4 lg:text-left lg:before:hidden"
                    >
                      {payment.amount.toFixed(2)}
                    </td>

                    <td
                      data-label="Method"
                      className="flex items-start justify-between gap-4 py-2 text-right text-sm font-medium before:shrink-0 before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-[#5B6B7E] before:content-[attr(data-label)] lg:table-cell lg:px-6 lg:py-4 lg:text-left lg:before:hidden"
                    >
                      {payment.payMethod}
                    </td>

                    <td
                      data-label="Date"
                      className="flex items-start justify-between gap-4 py-2 text-right text-sm font-medium before:shrink-0 before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-[#5B6B7E] before:content-[attr(data-label)] lg:table-cell lg:whitespace-nowrap lg:px-6 lg:py-4 lg:text-left lg:font-normal lg:text-[#5B6B7E] lg:before:hidden"
                    >
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "en-GB",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: "Asia/Colombo",
                        },
                      )}
                    </td>

                    <td
                      data-label="Status"
                      className="-mx-5 -mb-5 mt-3 flex items-center justify-between gap-4 rounded-b-3xl bg-[#F4F6FA] px-5 py-3 text-sm before:shrink-0 before:text-xs before:font-semibold before:uppercase before:tracking-wide before:text-[#5B6B7E] before:content-[attr(data-label)] lg:m-0 lg:table-cell lg:rounded-none lg:bg-transparent lg:px-6 lg:py-4 lg:before:hidden"
                    >
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          status === "PENDING"
                            ? "bg-[#FDECE4] text-[#9A3412]"
                            : status === "PAID"
                              ? "bg-[#E4EEE8] text-[#1B4332]"
                              : "bg-[#E2E7EF] text-[#0D1B2A]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            status === "PENDING"
                              ? "bg-[#C2410C]"
                              : status === "PAID"
                                ? "bg-[#1B4332]"
                                : "bg-[#0D1B2A]"
                          }`}
                        />
                        {payment.paymentStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mx-auto mt-8 flex w-fit items-center gap-1.5 rounded-2xl border border-[#E2E7EF] bg-white p-1.5 shadow-sm">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0D1B2A] transition-colors hover:bg-[#006D77] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006D77] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#0D1B2A]"
            disabled={pagination?.currentPage === 1 ? true : false}
            onClick={() => setPage((pagination?.currentPage as number) - 1)}
          >
            {"<"}
          </button>

          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#5B6B7E] ${pagination?.currentPage === 1 ? "invisible" : "visible"}`}
          >
            {pagination ? pagination.currentPage - 1 : ""}
          </span>

          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0D1B2A] text-sm font-semibold text-white">
            {pagination?.currentPage}
          </span>

          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium text-[#5B6B7E] ${pagination?.currentPage === pagination?.totalPages ? "invisible" : "visible"}`}
          >
            {pagination ? pagination.currentPage + 1 : ""}
          </span>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0D1B2A] transition-colors hover:bg-[#006D77] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006D77] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#0D1B2A]"
            disabled={
              pagination?.currentPage === pagination?.totalPages ? true : false
            }
            onClick={() => setPage((pagination?.currentPage as number) + 1)}
          >
            {">"}
          </button>
        </div>

        <div className="mt-3 text-center text-sm text-[#5B6B7E]">
          Total pages:{" "}
          <span className="font-semibold text-[#0D1B2A]">
            {pagination?.totalPages ?? 0}
          </span>
        </div>
      </div>
    );
  }
};

export default PaymentsPage;
