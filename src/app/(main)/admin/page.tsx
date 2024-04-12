"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

interface UserData {
  id: string;
  uid: string;
  name: string;
  gradeLevel: string;
  email: string;
  authProvider: string;
  accountType: string;
}

const AdminPage = () => {
  const [accounts, setAccounts] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsCollection = collection(db, "users");
        const accountsSnapshot = await getDocs(accountsCollection);
        const accountsData = accountsSnapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as UserData)
        );
        setAccounts(accountsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const handleDecline = async (accountId: string) => {
    try {
      await deleteDoc(doc(db, "users", accountId));
      setAccounts(accounts.filter((account) => account.id !== accountId));
    } catch (error) {
      console.error("Error declining account:", error);
    }
  };

  const handleApprove = async (accountId: string, newAccountType: string) => {
    try {
      await updateDoc(doc(db, "users", accountId), {
        accountType: newAccountType,
      });
      setAccounts(
        accounts.map((account) => {
          if (account.id === accountId) {
            return { ...account, accountType: newAccountType };
          }
          return account;
        })
      );
    } catch (error) {
      console.error("Error approving account:", error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-extrabold text-center mb-6 text-white">
        Admin Page
      </h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border border-gray-200">Name</th>
              <th className="px-4 py-2 border border-gray-200">Grade Level</th>
              <th className="px-4 py-2 border border-gray-200">Email</th>
              <th className="px-4 py-2 border border-gray-200">Account Type</th>
              <th className="px-4 py-2 border border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody className="text-white">
            {accounts.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-2 border border-gray-200">
                  {account.name}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {account.gradeLevel}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  {account.email}
                </td>
                <td className="px-4 py-2 border border-gray-200">
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <button className=" text-blue-600 font-bold px-4 py-1 rounded">
                        {account.accountType}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Change Account Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleApprove(account.id, "Teacher")}
                      >
                        Teacher
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleApprove(account.id, "Student")}
                      >
                        Student
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleApprove(account.id, "Organization")
                        }
                      >
                        Organization
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>

                <td className="px-4 py-2 border border-gray-200">
                  <button
                    className="mr-2 bg-red-500 text-white px-4 py-1 rounded"
                    onClick={() => handleDecline(account.id)}
                  >
                    Decline
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage;
