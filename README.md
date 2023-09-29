# Freelankakot: Freelancer smart contract in *Substrate node*

Freelankakot is a freelancing platform in Polkadot developed [ink!](https://github.com/paritytech/ink) programing language with [Substrate](https://substrate.io).  

- Platform for freelancers, employers and businesses
- Intergrate power of blockchain
- Built on Polkadot

## Architecture of smart contract

```mermaid

classDiagram
  class User {
    + jobs : Mapping<JobId, Job>
    + owner_job : Mapping<AccountId, JobId>
    + doing_job : Mapping<AccountId, JobId>
    + assigned_job : Mapping<JobId, AccountId>
    + current_job_id : JobId
    + profile_user: Mapping<RatingPoint, Vec<CompletedJob>>
    + role : AccountRole
    + new() : User
    + create(name: String, description: String) : void
    + get_open_jobs() : Vec<Job>
    + obtain(job_id: JobId) : Result<(), JobError>
    + submit(job_id: JobId, result: String) : Result<(), JobError>
    + reject(job_id: JobId) : Result<(), JobError>
    + cancle(job_id: JobID) : Result<(),JobError>
    + approval(job_id: JobId) : Result<(), JobError>
    + validate(job_id: JobId) : bool
    + check_balance(job_id: JobId) : bool
    + save_to_blockchain(job_id: JobId) : bool
    + add_member(account_id: AccountId) : void
    + remove_member(account_id: AccountId) : void
    + select_job_for_team(job_id: JobId) : void
    + set_owner_job(account_id: AccountId, job_id: JobId) : void
    + get_owner_job(account_id: AccountId) : JobId
    + set_doing_job(account_id: AccountId, job_id: JobId) : void
    + get_doing_job(account_id: AccountId) : JobId
    + set_assigned_job(job_id: JobId, account_id: AccountId) : void
    + get_assigned_job(job_id: JobId) : AccountId
    + set_current_job_id(job_id: JobId) : void
    + get_current_job_id() : JobId
    + set_account_type(account_type: AccountRole) : void
    + get_account_type() : AccountRole
    + complaint(job_id: JobId) : Result<(), JobError> // Added method
    + negotiate(job_id: JobId, feedback: String, evidence: Vec<String>, token_value: u64, agreed: bool) : Result<(), JobError> // Added method
    + resolve(job_id: JobId, report: Report) : Result<(), JobError> // Added method
    + rate_partner(job_id: JobId, rating: RatingPoint) : Result<(), JobError> // Added method
  }

  class Job {
    + name : String
    + description : String
    + result : Option<String>
    + status : Status
    + budget : Balance
    + set_status(status: Status) : void
    + get_status() : Status
  }

  class Status {
    + OPEN
    + DOING
    + REVIEW
    + REOPEN
    + FINISH
    + COMPLAINT // Added status
    + REPORT // Added status

  }

  class JobError {    
    + Registered, //đã đăng kí tài khoản (đăng kí), không đăng kí nữa
    + NotRegistered, // chưa đăng kí tài khoản.
    + NotJobAssigner, // bạn không phải là người giao việc
    + NotFreelancer, // bạn không phải là freelancer
    + CreatedJob, //Job đã tạo
    + NotExisted, // Job không tồn tại
    + NotTaked, // chưa có người nhận job
    + Taked, //đã có người nhận
    + NotTakeThisJob, // bạn ko có nhận job này
    + NotAssignThisJob, //bạn ko phải là người giao việc này
    + Submited, //đã submit 
    + Proccesing, //đang có người làm
    + CurrentJobIncomplete, //hoàn thành job hiện tại đã
    + JobInvalid,
    + Finish, //job đã hoàn thành    
  }

  class JobId {
    + id : String
    + new(id: String) : JobId
    + to_string() : String
  }

  class AccountId {
    + id : String
    + new(id: String) : AccountId
    + to_string() : String
  }

  class AccountRole {
    + ENTERPRISE
    + INVIDUAL
    + FREELANCER
    + is_owner_job() : bool
    + is_freelancer() : bool
    + is_team_leader() : bool
  }

  class RatingPoint {
    + value : u32
    + new(value: u32) : RatingPoint
    + to_string() : String
  }

  class CompletedJob {
    + job_id : JobId
    + feedback : String
    + new(job_id: JobId, feedback: String) : CompletedJob
  }

  class Balance {
    + amount : u64
    + new(amount: u64) : Balance
    + to_string() : String
  }

  class Dapp {
    + user : User
    + createJob(jobID: JobId): Result // Updated method signature
    + cancleJob(jobID: JobId): Result // Updated method signature
    + createTeam(Map<String, String>): Result
    + addMember(userId: AccountID): Result
    + removeMember(userID: AccountID): Result
    + displayOpenJobs() : void
    + obtainJob(jobId: JobId) : void
    + submitJobResult(jobId: JobId, result: String) : void
    + rejectJob(jobId: JobId) : void
    + approveJob(jobId: JobId) : void
    + getFreelancerAccountType() : AccountType
  }

  Dapp -- AccountRole
  AccountRole -- User
  User -- Balance
  User --* Job
  User -- JobId
  User -- AccountId
  User -- RatingPoint
  User -- CompletedJob
  JobError -- Job
  Job -- Status


```
