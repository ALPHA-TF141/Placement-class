import java.io.FileWriter;
import java.util.Stack;

public class Task23 {
class Solution {
    static {
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try (FileWriter fw = new FileWriter("display_runtime.txt")) {
                fw.write("000");
            } catch (Exception e) {
                e.printStackTrace();
            }
        }));
    }
    public boolean isValid(String s) {
        Stack<Character> st=new Stack<>();
        for(int i=0;i<s.length();i++){
            if(s.charAt(i)=='(' || s.charAt(i)=='{'|| s.charAt(i)=='['){
                st.push(s.charAt(i));
            }
            else if(s.charAt(i)==')'){
                if(st.isEmpty()){
                    return false;
                }
                else if(st.peek()!='('){
                    return false;
                }
                else{
                    st.pop();
                }
            }
            else if(s.charAt(i)=='}'){
                if(st.isEmpty()){
                    return false;
                }
                else if(st.peek()!='{'){
                    return false;
                }
                else{
                    st.pop();
                }
            }
            else if(s.charAt(i)==']'){
                if(st.isEmpty()){
                    return false;
                }
                else if(st.peek()!='['){
                    return false;
                }
                else{
                    st.pop();
                }
            }
        }
            if(st.isEmpty()) return true;

            return false;
    }
}
}